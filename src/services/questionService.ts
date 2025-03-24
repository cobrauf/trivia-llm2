import { QuestionGenerationParams, Question } from "@/schemas/question";

interface QuestionGenerationProgress {
  questions: Question[];
  isComplete: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

export async function generateQuestionsSequentially(
  params: QuestionGenerationParams,
  onProgress: (progress: QuestionGenerationProgress) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    console.log(
      `Starting question generation for ${params.questionCount} questions about ${params.topic}`
    );

    // Set up fetch with a timeout for network connectivity issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      // Use streaming API for all questions at once
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: params.topic,
          questionCount: params.questionCount,
          difficulty: params.difficulty,
          stream: true, // Use streaming for all questions
        }),
        signal: controller.signal,
      });

      // Clear the fetch timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(
          `Failed to fetch questions: ${response.status} ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const allQuestions: Question[] = [];
      let hasNotifiedFirstQuestion = false;
      let buffer = "";

      console.log("Stream connected, waiting for data...");

      try {
        // Set a deadline for receiving the first valid data
        // Rather than using setTimeout, we'll track the start time
        const startTime = Date.now();
        const dataReceivedTimeout = 5000; // 5 seconds
        let receivedValidData = false;

        while (true) {
          const { done, value } = await reader.read();

          // Check if we've timed out waiting for valid data
          if (
            !receivedValidData &&
            Date.now() - startTime > dataReceivedTimeout
          ) {
            throw new Error("Timeout waiting for data from LLM service");
          }

          if (done) {
            console.log("Stream complete");
            // When stream is complete and we have at least one question, mark as complete
            if (allQuestions.length > 0) {
              onProgress({
                questions: allQuestions,
                isComplete: true,
                progress: {
                  current: allQuestions.length,
                  total: params.questionCount,
                },
              });
            }
            break;
          }

          // Add the new chunk to our buffer and decode it
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          console.log("Received chunk of data:", chunk.length, "bytes");

          // Split on newlines to find complete JSON objects
          const lines = buffer.split("\n");
          // Keep the potentially incomplete line for next time
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              console.log(
                "Processing line:",
                line.slice(0, 50) + (line.length > 50 ? "..." : "")
              );
              const data = JSON.parse(line);
              console.log("Parsed data:", data);

              // Mark that we've received valid data
              receivedValidData = true;

              // Check if we received an error
              if (data.error) {
                console.error("Received error in stream:", data.error);
                throw new Error(data.error);
              }

              // Check if we received new questions
              if (data.questions && data.questions.length > 0) {
                console.log(`Received ${data.questions.length} new questions`);
                // Add new questions to our collection
                let hasNewQuestions = false;

                for (const question of data.questions) {
                  // Only add if it's not a duplicate
                  if (
                    !allQuestions.some((q) => q.question === question.question)
                  ) {
                    allQuestions.push(question);
                    hasNewQuestions = true;
                  }
                }

                if (hasNewQuestions) {
                  // If this is the first question, notify immediately
                  if (!hasNotifiedFirstQuestion && allQuestions.length > 0) {
                    hasNotifiedFirstQuestion = true;
                    console.log("Notifying first question available");
                    onProgress({
                      questions: [...allQuestions],
                      isComplete: false,
                      progress: {
                        current: allQuestions.length,
                        total: params.questionCount,
                      },
                    });
                  } else {
                    // For subsequent questions, notify with the current state
                    console.log(
                      "Updating with new questions, count:",
                      allQuestions.length
                    );
                    onProgress({
                      questions: [...allQuestions],
                      isComplete: data.done === true,
                      progress: {
                        current: allQuestions.length,
                        total: params.questionCount,
                      },
                    });
                  }
                }
              } else if (data.done === true) {
                // Stream is complete
                console.log("Received completion marker");
                onProgress({
                  questions: [...allQuestions],
                  isComplete: true,
                  progress: {
                    current: allQuestions.length,
                    total: params.questionCount,
                  },
                });
              }
            } catch (parseError) {
              console.error(
                "Error parsing JSON line:",
                parseError,
                "Line:",
                line
              );
              // Skip lines that aren't valid JSON
              continue;
            }
          }
        }
      } catch (streamError) {
        console.error("Error reading stream:", streamError);
        reader.cancel();

        // If we have at least one question, consider it a partial success
        if (allQuestions.length > 0) {
          console.log(
            "Stream error but we have some questions, continuing with partial results"
          );
          onProgress({
            questions: allQuestions,
            isComplete: true,
            progress: {
              current: allQuestions.length,
              total: params.questionCount,
            },
          });
        } else {
          throw streamError;
        }
      }
    } catch (fetchError: any) {
      // Clear the fetch timeout
      clearTimeout(timeoutId);

      // Handle abort errors specially
      if (fetchError.name === "AbortError") {
        throw new Error(
          "Connection to LLM service timed out. Please check your network or service availability."
        );
      }

      // Re-throw other errors
      throw fetchError;
    }
  } catch (err) {
    console.error("Top-level error in question generation:", err);

    // Format connection errors more helpfully
    let errorMessage = "An error occurred";
    if (err instanceof Error) {
      errorMessage = err.message;

      // Check if it's a connection-related error
      if (
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("abort") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("network")
      ) {
        errorMessage = `Connection error: The LLM service might be unavailable. ${errorMessage}`;
      }
    }

    onError(errorMessage);
  }
}
