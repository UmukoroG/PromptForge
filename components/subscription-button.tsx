"use client";

import axios from "axios";
import { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";

export const SubscriptionButton = ({
  isPro = false
}: {
  isPro: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const proModal = useProModal();

  const onClick = async () => {
    if (!isPro) {
      // Open modal for free users
      proModal.onOpen();
      return;
    }

    // For pro users, redirect to billing portal
    try {
      setLoading(true);

      const response = await axios.get("/api/stripe");

      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={isPro ? "default" : "premium"} disabled={loading} onClick={onClick} >
      {isPro ? "Manage Subscription" : "Upgrade"}
      {!isPro && <Zap className="w-4 h-4 ml-2 fill-white" />}
    </Button>
  )
};
