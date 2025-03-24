import { NextResponse } from "next/server";
import { QuestionGenerationSchema } from "@/schemas/question";
import { generateQuestionsStream } from "@/lib/openrouter";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = QuestionGenerationSchema.parse(body);
    console.log("API request received:", { ...params, stream: body.stream });

    // When streaming, always request all questions at once
    const questionCount = body.stream
      ? params.questionCount
      : body.remaining
      ? params.questionCount - 1
      : 1;

    // Pass the initial question if provided to avoid duplicates
    const initialQuestion = body.initialQuestion
      ? body.initialQuestion
      : undefined;

    // If streaming is requested, use the streaming version
    if (body.stream) {
      console.log(
        `Setting up streaming response for ${questionCount} questions`
      );
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
          console.log("Starting stream processing");
          for await (const chunk of questionsStream) {
            // Debug log each chunk
            console.log(
              "Streaming chunk:",
              JSON.stringify(chunk).slice(0, 100) + "..."
            );

            // Send each chunk as a newline-delimited JSON string
            const jsonString = JSON.stringify(chunk) + "\n";
            await writer.write(encoder.encode(jsonString));
          }
          console.log("Stream completed successfully");
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
      console.log(
        `Using non-streaming response for ${questionCount} questions`
      );
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

      console.log(
        `Returning ${allQuestions.length} questions in single response`
      );
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
