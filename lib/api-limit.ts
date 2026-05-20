import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

// Free tier limit - users can make 5 requests before needing to upgrade
const MAX_FREE_COUNTS = 5;

/**
 * Increments the API usage count for the current user
 */
export const incrementApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId },
  });

  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: { userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { userId, count: 1 },
    });
  }
};

/**
 * Checks if the user has reached their API limit
 * @returns true if user has reached the limit, false otherwise
 */
export const checkApiLimit = async (): Promise<boolean> => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId },
  });

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  }

  return false;
};

/**
 * Gets the current API usage count for the user
 * @returns The number of API calls made
 */
export const getApiLimitCount = async (): Promise<number> => {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId },
  });

  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};
