import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

// Number of days to consider a subscription valid after period end (grace period)
const DAY_IN_MS = 86_400_000;

/**
 * Checks if the user has an active pro subscription
 * @returns true if user has active subscription, false otherwise
 */
export const checkSubscription = async (): Promise<boolean> => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: { userId },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  // Check if subscription is valid (has all required fields and not expired)
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
};

/**
 * Gets the user's subscription details
 * @returns Subscription object or null
 */
export const getSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: { userId },
  });

  return userSubscription;
};
