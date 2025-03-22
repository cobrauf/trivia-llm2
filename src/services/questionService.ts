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
    onProgress({
      questions: initialData.questions,
      isComplete: false,
    });

    // Request remaining questions
    const remainingResponse = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        remaining: true,
      }),
    });

    if (!remainingResponse.ok) {
      throw new Error("Failed to fetch remaining questions");
    }

    const remainingData = await remainingResponse.json();
    onProgress({
      questions: [...initialData.questions, ...remainingData.questions],
      isComplete: true,
    });
  } catch (err) {
    onError(err instanceof Error ? err.message : "An error occurred");
  }
}
