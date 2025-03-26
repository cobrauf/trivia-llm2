import { NextResponse } from "next/server";
import { QuestionGenerationSchema } from "@/schemas/question";
import { generateQuestionsStream } from "@/lib/openrouter";
import { z } from "zod";

// Simple cache to prevent duplicate requests
// This helps avoid multiple identical requests to OpenRouter
type QuestionsStreamGenerator = ReturnType<typeof generateQuestionsStream>;
const requestCache = new Map<string, QuestionsStreamGenerator>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = QuestionGenerationSchema.parse(body);
    console.log("API request received:", { ...params, stream: body.stream });

    // Generate a cache key based on the request parameters
    const cacheKey = JSON.stringify({
      topic: params.topic,
      questionCount: params.questionCount,
      difficulty: params.difficulty,
      streaming: body.stream,
    });

    // Always use the full question count
    const questionCount = params.questionCount;

    // We no longer need the initialQuestion param to avoid duplicates
    // since we're generating all questions at once
    const generatorParams = {
      ...params,
      questionCount,
    };

    // If streaming is requested, use the streaming version
    if (body.stream) {
      console.log(
        `Setting up streaming response for ${questionCount} questions`
      );

      // Check if we already have a request in progress
      if (requestCache.has(cacheKey)) {
        console.log("Using cached request for streaming");
      } else {
        console.log("Starting new request to OpenRouter for streaming");
      }

      // Use a TransformStream to convert the AsyncGenerator to a proper stream
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Create and cache the generator if needed
      if (!requestCache.has(cacheKey)) {
        const generator = generateQuestionsStream(generatorParams, (status) => {
          // Send status updates through the stream
          writer.write(encoder.encode(JSON.stringify({ status }) + "\n"));
        });
        requestCache.set(cacheKey, generator);

        // Remove from cache after a reasonable timeout (5 minutes)
        setTimeout(() => {
          requestCache.delete(cacheKey);
        }, 5 * 60 * 1000);
      }

      // Get the generator
      const questionsStream = requestCache.get(cacheKey)!;

      // Process the generator in a separate async task
      (async () => {
        console.log("Starting stream processing");

        try {
          // Set a 5-second timeout for the first chunk to arrive
          let firstChunkReceived = false;
          const timeoutPromise = new Promise<void>((_, reject) => {
            const timeout = setTimeout(() => {
              if (!firstChunkReceived) {
                reject(new Error("Connection timeout with LLM service"));
              }
            }, 5000);

            // Clear the timeout if not needed
            return () => clearTimeout(timeout);
          });

          // Create a promise to process all chunks
          const processPromise = (async () => {
            for await (const chunk of questionsStream) {
              // Mark that we've received the first chunk
              if (!firstChunkReceived) {
                firstChunkReceived = true;
              }

              // Debug log each chunk
              console.log(
                "Streaming chunk:",
                JSON.stringify(chunk).slice(0, 100) + "..."
              );

              // Send each chunk as a newline-delimited JSON string
              const jsonString = JSON.stringify(chunk) + "\n";
              await writer.write(encoder.encode(jsonString));
            }
          })();

          // Race the timeout against the processing
          await Promise.race([timeoutPromise, processPromise]);

          // If we got here without an error, the stream completed successfully
          if (firstChunkReceived) {
            console.log("Stream completed successfully");
          }
        } catch (error) {
          console.error("Error in streaming response:", error);

          // Create a more specific error message for connection issues
          let errorMessage = "Failed to generate questions";

          if (error instanceof Error) {
            errorMessage = error.message;

            // Check for connection-related errors
            if (
              error.message.includes("ECONNREFUSED") ||
              error.message.includes("timeout") ||
              error.message.includes("abort") ||
              error.message.includes("network") ||
              error.message.includes("connection")
            ) {
              errorMessage = `LLM service connection error: ${error.message}. The service might be unavailable.`;
            }
          }

          // Write error to stream before closing
          const errorChunk = JSON.stringify({ error: errorMessage }) + "\n";
          await writer.write(encoder.encode(errorChunk));
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

      // Check if we already have a request in progress
      if (requestCache.has(cacheKey)) {
        console.log("Using cached request for non-streaming");
      } else {
        console.log("Starting new request to OpenRouter for non-streaming");
        // Create and cache the generator
        const generator = generateQuestionsStream(generatorParams);
        requestCache.set(cacheKey, generator);

        // Remove from cache after a reasonable timeout (5 minutes)
        setTimeout(() => {
          requestCache.delete(cacheKey);
        }, 5 * 60 * 1000);
      }

      // Get the generator
      const questionsStream = requestCache.get(cacheKey)!;

      const allQuestions = [];

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
