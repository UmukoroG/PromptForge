"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { Check, Zap, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";

import { useProModal } from "@/hooks/use-pro-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StripeProvider } from "@/components/stripe-provider";
import { PaymentForm } from "@/components/payment-form";

const tools = [
  {
    label: "Conversation",
    icon: "💬",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Music Generation",
    icon: "🎵",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Code Generation",
    icon: "💻",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
  },
];

export const ProModal = () => {
  const proModal = useProModal();
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal closes
    if (!proModal.isOpen) {
      setShowPaymentForm(false);
      setClientSecret(null);
      setCustomerId(null);
      setLoading(false);
    }
  }, [proModal.isOpen]);

  const handleUpgradeClick = async () => {
    try {
      setLoading(true);
      console.log("[PRO_MODAL] Creating payment intent...");

      // Create payment intent
      const response = await axios.post("/api/create-payment-intent");
      console.log("[PRO_MODAL] Payment intent created:", response.data);

      setClientSecret(response.data.clientSecret);
      setCustomerId(response.data.customerId);
      setShowPaymentForm(true);
      setLoading(false);
    } catch (error: any) {
      console.error("[PRO_MODAL] Error creating payment intent:", error);
      toast.error(error?.response?.data?.error || "Failed to initialize payment");
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    setCustomerId(null);
  };

  if (showPaymentForm && clientSecret && customerId) {
    return (
      <Dialog
        open={proModal.isOpen}
        onOpenChange={() => {
          proModal.onClose();
          setShowPaymentForm(false);
          setClientSecret(null);
          setCustomerId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
              <div className="flex items-center gap-x-2 font-bold text-xl">
                <CreditCard className="w-6 h-6" />
                Payment Details
              </div>
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Enter your card details to subscribe to promptForge Pro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Pricing Summary */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">promptForge Pro</p>
                  <p className="text-2xl font-bold">$20/month</p>
                </div>
                <Badge className="bg-white text-purple-600">PRO</Badge>
              </div>
            </div>

            {/* Stripe Payment Form */}
            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm customerId={customerId} onBack={handleBack} />
            </StripeProvider>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            <div className="flex items-center gap-x-2 font-bold text-xl">
              Upgrade to promptForge
              <Badge className="uppercase text-sm py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
                pro
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
            {tools.map((tool) => (
              <Card
                key={tool.label}
                className="p-3 border-black/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-x-4">
                  <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                    <span className="text-2xl">{tool.icon}</span>
                  </div>
                  <div className="font-semibold text-sm">{tool.label}</div>
                </div>
                <Check className="text-primary w-5 h-5" />
              </Card>
            ))}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-4 pt-4">
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-x-2">
              <span className="text-4xl font-bold">$20</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unlimited AI generations. Cancel anytime.
            </p>
          </div>
          <Button
            onClick={handleUpgradeClick}
            disabled={loading}
            size="lg"
            variant="premium"
            className="w-full"
          >
            {loading ? "Loading..." : "Continue to Payment"}
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
