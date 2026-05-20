import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    console.log("[PAYMENT_INTENT] Starting payment intent creation...");

    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("[PAYMENT_INTENT] No user found - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[PAYMENT_INTENT] User ID:", userId);
    console.log("[PAYMENT_INTENT] User email:", user?.emailAddresses?.[0]?.emailAddress);

    // Create or retrieve Stripe customer
    let customerId: string;

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: user.emailAddresses[0].emailAddress,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[PAYMENT_INTENT] Existing customer found:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;
      console.log("[PAYMENT_INTENT] New customer created:", customerId);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // $20.00
      currency: "usd",
      customer: customerId,
      metadata: {
        userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("[PAYMENT_INTENT] Payment intent created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
    });
  } catch (error: any) {
    console.error("[PAYMENT_INTENT] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Error" },
      { status: 500 }
    );
  }
}
