import Stripe from "stripe";

// Log Stripe configuration
console.log("[STRIPE_CONFIG] Initializing Stripe...");
console.log("[STRIPE_CONFIG] API Key exists:", !!process.env.STRIPE_API_KEY);
console.log("[STRIPE_CONFIG] API Key prefix:", process.env.STRIPE_API_KEY?.substring(0, 7));

if (!process.env.STRIPE_API_KEY) {
  console.error("[STRIPE_CONFIG] ERROR: STRIPE_API_KEY is not set!");
}

if (process.env.STRIPE_API_KEY && !process.env.STRIPE_API_KEY.startsWith('sk_')) {
  console.warn("[STRIPE_CONFIG] WARNING: STRIPE_API_KEY should start with 'sk_test_' or 'sk_live_'");
  console.warn("[STRIPE_CONFIG] Current prefix:", process.env.STRIPE_API_KEY.substring(0, 3));
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2022-11-15",
  typescript: true,
});
