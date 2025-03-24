import { NextResponse } from "next/server";
import { QuestionGenerationSchema } from "@/schemas/question";
import { generateQuestionsStream } from "@/lib/openrouter";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = QuestionGenerationSchema.parse(body);

    // Determine how many questions to generate based on whether this is a remaining request
    const questionCount = body.remaining ? params.questionCount - 1 : 1;

    // If this is a remaining request and we have an initial question,
    // pass it to avoid duplicates
    const initialQuestion =
      body.remaining && body.initialQuestion ? body.initialQuestion : undefined;

    // If streaming is requested, use the streaming version
    if (body.stream) {
      const questionsStream = generateQuestionsStream({
        ...params,
        questionCount,
        initialQuestion,
      });

      // Use a TransformStream to convert the AsyncGenerator to a proper stream
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Process the generator in a separate async task
      (async () => {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of questionsStream) {
            // Send each chunk as a newline-delimited JSON string
            await writer.write(encoder.encode(JSON.stringify(chunk) + "\n"));
          }
        } catch (error) {
          console.error("Error in streaming response:", error);
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // For backwards compatibility, keep the non-streaming version
      const allQuestions = [];
      const questionsStream = generateQuestionsStream({
        ...params,
        questionCount,
        initialQuestion,
      });

      // Collect all questions
      for await (const chunk of questionsStream) {
        if (chunk.questions) {
          allQuestions.push(...chunk.questions);
        }
      }

      return NextResponse.json({ questions: allQuestions });
    }
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
