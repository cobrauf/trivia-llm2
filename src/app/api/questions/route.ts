import { NextResponse } from "next/server";
import { QuestionGenerationSchema } from "@/schemas/question";
import {
  generateInitialQuestion,
  generateRemainingQuestions,
} from "@/lib/openrouter";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = QuestionGenerationSchema.parse(body);

    // Check if this is a request for remaining questions
    const isRemainingRequest = body.remaining === true;

    const questions = isRemainingRequest
      ? await generateRemainingQuestions(params)
      : await generateInitialQuestion(params);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
