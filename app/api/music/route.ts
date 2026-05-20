import Replicate from "replicate";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { withRetry } from "@/lib/retry";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt  } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check if user has active subscription
    const isPro = await checkSubscription();

    // If not pro, check API limits
    if (!isPro) {
      const freeTrial = await checkApiLimit();
      if (!freeTrial) {
        return NextResponse.json(
          { error: "Free trial has expired. Please upgrade to pro." },
          { status: 403 }
        );
      }
    }

    const response = await withRetry(
      () =>
        replicate.run(
          "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
          {
            input: {
              prompt_a: prompt
            }
          }
        ),
      {
        timeout: 60000, // 60 second timeout (music generation takes longer)
      }
    );

    // Increment API usage count if not pro
    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.log('[MUSIC_ERROR]', error);

    const errorMessage = error?.message || '';

    // Handle timeout errors
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: "Music generation timed out. Please try again." },
        { status: 504 }
      );
    }

    // Handle Replicate-specific errors
    if (errorMessage.includes('Payment Required') || error?.response?.status === 402) {
      return NextResponse.json(
        { error: "Replicate payment required. Please add a payment method at https://replicate.com/account/billing" },
        { status: 402 }
      );
    }

    if (errorMessage.includes('Too Many Requests') || error?.response?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a few moments." },
        { status: 429 }
      );
    }

    if (errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid API') || error?.response?.status === 401) {
      return NextResponse.json(
        { error: "Invalid Replicate API token. Please check your configuration." },
        { status: 401 }
      );
    }

    if (errorMessage.includes('Model not found')) {
      return NextResponse.json(
        { error: "Music generation model not found. Please contact support." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate music. Please try again." },
      { status: 500 }
    );
  }
};
