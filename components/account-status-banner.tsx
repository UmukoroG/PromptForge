"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";

interface AccountStatusBannerProps {
  isPro: boolean;
  apiLimitCount: number;
}

const MAX_FREE_COUNTS = 5;

export const AccountStatusBanner = ({ isPro, apiLimitCount }: AccountStatusBannerProps) => {
  const proModal = useProModal();
  const usagePercentage = (apiLimitCount / MAX_FREE_COUNTS) * 100;

  if (isPro) {
    return (
      <Card className="p-4 mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 fill-white" />
            <div>
              <p className="font-semibold">Pro Plan Active</p>
              <p className="text-sm text-white/80">Unlimited access to all features</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="secondary" size="sm">
              Manage Plan
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-8 border-yellow-200 bg-yellow-50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-sm text-yellow-900">Free Plan</p>
              <p className="text-xs text-yellow-700">
                {MAX_FREE_COUNTS - apiLimitCount} of {MAX_FREE_COUNTS} generations remaining
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            {apiLimitCount}/{MAX_FREE_COUNTS}
          </Badge>
        </div>
        <Progress value={usagePercentage} className="h-2" />
        {apiLimitCount >= MAX_FREE_COUNTS ? (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-yellow-800">
              You&apos;ve reached your free limit. Upgrade for unlimited access!
            </p>
            <Button
              onClick={proModal.onOpen}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
            >
              Upgrade Now
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-yellow-700">
              Upgrade to Pro for unlimited generations
            </p>
            <Button
              onClick={proModal.onOpen}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
