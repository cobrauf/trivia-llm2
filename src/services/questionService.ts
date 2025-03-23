import { QuestionGenerationParams, Question } from "@/schemas/question";

interface QuestionGenerationProgress {
  questions: Question[];
  isComplete: boolean;
}

export async function generateQuestionsSequentially(
  params: QuestionGenerationParams,
  onProgress: (progress: QuestionGenerationProgress) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Request initial question
    const initialResponse = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        questionCount: params.questionCount,
        difficulty: params.difficulty,
      }),
    });

    if (!initialResponse.ok) {
      throw new Error("Failed to fetch initial question");
    }

    const initialData = await initialResponse.json();

    // Notify that we have the first question but more are coming
    onProgress({
      questions: initialData.questions,
      isComplete: false,
    });

    try {
      // Request remaining questions
      const remainingResponse = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          remaining: true,
          // Pass the initial question to avoid duplicates
          initialQuestion: initialData.questions[0],
        }),
      });

      if (!remainingResponse.ok) {
        console.error(
          "Failed to fetch remaining questions, but continuing with initial question"
        );
        // We'll still mark as complete since we have at least the first question
        onProgress({
          questions: initialData.questions,
          isComplete: true,
        });
        return;
      }

      const remainingData = await remainingResponse.json();

      // Update with all questions and mark as complete
      onProgress({
        questions: [...initialData.questions, ...remainingData.questions],
        isComplete: true,
      });
    } catch (remainingErr) {
      console.error("Error fetching remaining questions:", remainingErr);
      // Even if remaining questions fail, we'll mark as complete with what we have
      onProgress({
        questions: initialData.questions,
        isComplete: true,
      });
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : "An error occurred");
  }
}
