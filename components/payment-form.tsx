"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Zap, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaymentFormProps {
  customerId: string;
  onBack: () => void;
}

export const PaymentForm = ({ customerId, onBack }: PaymentFormProps) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("[PAYMENT_FORM] Stripe not loaded");
      return;
    }

    try {
      setLoading(true);
      console.log("[PAYMENT_FORM] Confirming payment...");

      // Confirm payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("[PAYMENT_FORM] Submit error:", submitError);
        toast.error(submitError.message || "Payment failed");
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("[PAYMENT_FORM] Payment error:", error);
        toast.error(error.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("[PAYMENT_FORM] Payment succeeded:", paymentIntent.id);

        // Show success state
        setSuccess(true);
        toast.success("Payment successful! Welcome to Pro!");

        // Create subscription
        console.log("[PAYMENT_FORM] Creating subscription...");
        await axios.post("/api/create-subscription", {
          customerId,
        });

        // Wait a moment to show success state, then redirect
        setTimeout(() => {
          router.refresh();
          window.location.href = "/settings";
        }, 2000);
      }
    } catch (error: any) {
      console.error("[PAYMENT_FORM] Error:", error);
      toast.error(error?.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Welcome to promptForge Pro. Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="space-y-2 pt-2">
        <Button
          type="submit"
          disabled={loading || !stripe || !elements}
          size="lg"
          variant="premium"
          className="w-full"
        >
          {loading ? "Processing..." : "Subscribe Now - $20/month"}
          <Zap className="w-4 h-4 ml-2 fill-white" />
        </Button>
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          Back
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured by Stripe. Cancel anytime.
      </p>
    </form>
  );
};
