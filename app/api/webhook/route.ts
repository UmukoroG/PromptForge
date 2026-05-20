import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.log("[WEBHOOK_ERROR]", error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Handle checkout session completed
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const userId = session.metadata.userId;

    // Create subscription
    await prismadb.userSubscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Reset API limit - remove the limit since user is now Pro
    await prismadb.userApiLimit.deleteMany({
      where: {
        userId,
      },
    });

    console.log(`[WEBHOOK] API limit removed for user: ${userId}`);
  }

  // Handle invoice payment succeeded (renewal)
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  // Handle subscription deletion/cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    // Find and delete the user subscription
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (userSubscription) {
      // Delete the subscription record
      await prismadb.userSubscription.delete({
        where: {
          stripeSubscriptionId: subscription.id,
        },
      });

      // Reset their API limit counter back to 0 for fresh start
      await prismadb.userApiLimit.deleteMany({
        where: {
          userId: userSubscription.userId,
        },
      });

      console.log(`[WEBHOOK] Subscription cancelled and API limit reset for user: ${userSubscription.userId}`);
    }
  }

  return new NextResponse(null, { status: 200 });
}
