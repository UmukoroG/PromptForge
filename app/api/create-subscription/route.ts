import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    console.log("[CREATE_SUBSCRIPTION] Starting subscription creation...");

    const { userId } = auth();
    const body = await req.json();
    const { customerId } = body;

    if (!userId) {
      console.error("[CREATE_SUBSCRIPTION] No user found - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!customerId) {
      console.error("[CREATE_SUBSCRIPTION] No customer ID provided");
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    console.log("[CREATE_SUBSCRIPTION] User ID:", userId);
    console.log("[CREATE_SUBSCRIPTION] Customer ID:", customerId);

    // Create or get product
    let product;
    const existingProducts = await stripe.products.list({
      limit: 1,
      active: true,
    });

    // Check if we have a promptForge Pro product
    const promptForgeProduct = existingProducts.data.find(
      p => p.name === "promptForge Pro"
    );

    if (promptForgeProduct) {
      product = promptForgeProduct;
      console.log("[CREATE_SUBSCRIPTION] Using existing product:", product.id);
    } else {
      product = await stripe.products.create({
        name: "promptForge Pro",
        description: "Unlimited AI Generations",
      });
      console.log("[CREATE_SUBSCRIPTION] Created new product:", product.id);
    }

    // Create or get price
    let price;
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 1,
    });

    if (existingPrices.data.length > 0) {
      price = existingPrices.data[0];
      console.log("[CREATE_SUBSCRIPTION] Using existing price:", price.id);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2000,
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });
      console.log("[CREATE_SUBSCRIPTION] Created new price:", price.id);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    console.log("[CREATE_SUBSCRIPTION] Subscription created:", subscription.id);

    // Save to database
    await prismadb.userSubscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Remove API limit
    await prismadb.userApiLimit.deleteMany({
      where: { userId },
    });

    console.log("[CREATE_SUBSCRIPTION] Database updated, API limit removed");

    return NextResponse.json({ success: true, subscriptionId: subscription.id });
  } catch (error: any) {
    console.error("[CREATE_SUBSCRIPTION] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Error" },
      { status: 500 }
    );
  }
}
