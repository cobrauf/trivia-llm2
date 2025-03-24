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
    // Use streaming API for all questions
    const response = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        questionCount: params.questionCount,
        difficulty: params.difficulty,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    const allQuestions: Question[] = [];
    let hasNotifiedFirstQuestion = false;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
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

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Try to parse any complete JSON objects from the buffer
        try {
          // Find lines that look like complete JSON objects
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the last (potentially incomplete) line in the buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);

              // Check if we received new questions
              if (data.questions && data.questions.length > 0) {
                // Add new questions to our collection
                for (const question of data.questions) {
                  // Only add if it's not a duplicate
                  if (
                    !allQuestions.some((q) => q.question === question.question)
                  ) {
                    allQuestions.push(question);
                  }
                }

                // If this is the first question, notify immediately
                if (!hasNotifiedFirstQuestion && allQuestions.length > 0) {
                  hasNotifiedFirstQuestion = true;
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
                  onProgress({
                    questions: [...allQuestions],
                    isComplete: data.done === true,
                    progress: {
                      current: allQuestions.length,
                      total: params.questionCount,
                    },
                  });
                }
              } else if (data.done === true) {
                // Stream is complete
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
              // Skip lines that aren't valid JSON
              continue;
            }
          }
        } catch (parseError) {
          console.error("Error parsing response chunk:", parseError);
          // Continue processing the stream even if there's a parse error
        }
      }
    } catch (streamError) {
      console.error("Error reading stream:", streamError);
      reader.cancel();

      // If we have at least one question, consider it a partial success
      if (allQuestions.length > 0) {
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
  } catch (err) {
    onError(err instanceof Error ? err.message : "An error occurred");
  }
}
