import { Settings } from "lucide-react";
import { currentUser } from "@clerk/nextjs";

import { Heading } from "@/components/heading";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import { SubscriptionButton } from "@/components/subscription-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const MAX_FREE_COUNTS = 5;

const SettingsPage = async () => {
  const user = await currentUser();
  const isPro = await checkSubscription();
  const apiLimitCount = await getApiLimitCount();

  return (
    <div>
      <Heading
        title="Settings"
        description="Manage your account settings and subscription."
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        {/* User Account Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Your account and profile details
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm text-muted-foreground">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User ID:</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {user?.id?.slice(0, 20)}...
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Subscription Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {isPro
                      ? "You are currently on the Pro plan"
                      : "You are currently on the Free plan"}
                  </p>
                </div>
                <Badge
                  variant={isPro ? "default" : "secondary"}
                  className={
                    isPro
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                      : ""
                  }
                >
                  {isPro ? "PRO" : "FREE"}
                </Badge>
              </div>
              <Separator />

              {/* Plan Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isPro ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm">AI Conversation</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isPro ? "Unlimited" : `${apiLimitCount}/${MAX_FREE_COUNTS} used`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isPro ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm">Code Generation</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isPro ? "Unlimited" : `${apiLimitCount}/${MAX_FREE_COUNTS} used`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isPro ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm">Music Generation</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isPro ? "Unlimited" : `${apiLimitCount}/${MAX_FREE_COUNTS} used`}
                  </span>
                </div>
              </div>

              {/* Usage Progress for Free Users */}
              {!isPro && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">
                        {apiLimitCount} / {MAX_FREE_COUNTS} generations
                      </span>
                    </div>
                    <Progress
                      value={(apiLimitCount / MAX_FREE_COUNTS) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {MAX_FREE_COUNTS - apiLimitCount} generations remaining
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Pricing Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {isPro ? "Current Plan Benefits" : "Upgrade to Pro"}
                </h4>
                {!isPro && (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">$20</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Unlimited AI Conversations
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Unlimited Code Generation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Unlimited Music Generation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Priority Support
                      </li>
                    </ul>
                  </div>
                )}
                {isPro && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      ✓ You have unlimited access to all AI features
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <SubscriptionButton isPro={isPro} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
