import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return <DashboardContent isPro={isPro} apiLimitCount={apiLimitCount} />;
}
