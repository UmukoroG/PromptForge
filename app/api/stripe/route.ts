import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    console.log("[STRIPE_API] Starting checkout session creation...");

    const { userId } = auth();
    const user = await currentUser();

    console.log("[STRIPE_API] User ID:", userId);
    console.log("[STRIPE_API] User email:", user?.emailAddresses?.[0]?.emailAddress);

    if (!userId || !user) {
      console.error("[STRIPE_API] No user found - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_API_KEY) {
      console.error("[STRIPE_API] STRIPE_API_KEY not configured");
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    console.log("[STRIPE_API] Checking existing subscription...");
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    // If user has subscription, redirect to billing portal
    if (userSubscription && userSubscription.stripeCustomerId) {
      console.log("[STRIPE_API] Existing subscription found, creating billing portal session...");
      try {
        const stripeSession = await stripe.billingPortal.sessions.create({
          customer: userSubscription.stripeCustomerId,
          return_url: settingsUrl,
        });

        console.log("[STRIPE_API] Billing portal URL:", stripeSession.url);
        return NextResponse.json({ url: stripeSession.url });
      } catch (stripeError: any) {
        console.error("[STRIPE_API] Stripe billing portal error:", stripeError);
        return NextResponse.json({ error: stripeError.message }, { status: 500 });
      }
    }

    // Create new checkout session for first-time subscribers
    console.log("[STRIPE_API] Creating new checkout session...");
    try {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.emailAddresses[0].emailAddress,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "promptForge Pro",
                description: "Unlimited AI Generations",
              },
              unit_amount: 2000, // $20.00
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
        },
      });

      console.log("[STRIPE_API] Checkout session created:", stripeSession.id);
      console.log("[STRIPE_API] Checkout URL:", stripeSession.url);
      return NextResponse.json({ url: stripeSession.url });
    } catch (stripeError: any) {
      console.error("[STRIPE_API] Stripe checkout error:", stripeError);
      console.error("[STRIPE_API] Stripe error type:", stripeError.type);
      console.error("[STRIPE_API] Stripe error code:", stripeError.code);
      return NextResponse.json({
        error: `Stripe error: ${stripeError.message}`,
        type: stripeError.type,
        code: stripeError.code
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[STRIPE_API] Unexpected error:", error);
    console.error("[STRIPE_API] Error stack:", error?.stack);
    return NextResponse.json({
      error: error?.message || "Internal Error",
      details: error?.toString()
    }, { status: 500 });
  }
}
