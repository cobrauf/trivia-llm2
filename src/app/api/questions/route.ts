import { NextResponse } from "next/server";
import { QuestionGenerationSchema } from "@/schemas/question";
import { generateQuestions } from "@/lib/openrouter";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = QuestionGenerationSchema.parse(body);
    const questions = await generateQuestions(params);

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
