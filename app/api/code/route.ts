import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { withRetry } from "@/lib/retry";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const instructionMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages  } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!configuration.apiKey) {
      return NextResponse.json({ error: "OpenAI API Key not configured." }, { status: 500 });
    }

    if (!messages) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }


    const response = await withRetry(
      () =>
        openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [instructionMessage, ...messages]
        }),
      {
        timeout: 30000, // 30 second timeout
      }
    );


    return NextResponse.json(response.data.choices[0].message);
  } catch (error: any) {
    console.log('[CODE_ERROR]', error);

    const errorMessage = error?.message || '';

    // Handle timeout errors
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: "Request timed out. Please try again with a shorter prompt." },
        { status: 504 }
      );
    }

    // Handle specific error types
    if (error?.response?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a few moments." },
        { status: 429 }
      );
    }

    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your configuration." },
        { status: 401 }
      );
    }

    if (error?.response?.status === 402) {
      return NextResponse.json(
        { error: "OpenAI payment required. Please add credits to your OpenAI account." },
        { status: 402 }
      );
    }

    if (errorMessage.includes('insufficient_quota')) {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Please check your billing details." },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate code. Please try again." },
      { status: 500 }
    );
  }
};

