"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DifficultyLevel } from "@/lib/quiz";
import { generateQuestionsSequentially } from "@/services/questionService";

const LoadingSpinner = () => (
  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// Component that uses the search params
function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topic = searchParams.get("topic") || "";
  const questionCount = parseInt(searchParams.get("questionCount") || "5", 10);
  const difficulty =
    (searchParams.get("difficulty") as DifficultyLevel) || "seasoned";

  const [progress, setProgress] = useState({
    current: 0,
    total: questionCount,
  });

  useEffect(() => {
    const startQuizGeneration = async () => {
      try {
        const params = { topic, questionCount, difficulty };

        // Store the total question count for progress indication
        sessionStorage.setItem(
          "quiz_questions_total",
          questionCount.toString()
        );

        // Initialize question generation
        generateQuestionsSequentially(
          params,
          ({ questions, isComplete, progress }) => {
            // Update progress if available
            if (progress) {
              setProgress(progress);
            }

            // When first question is ready, move to the quiz page
            if (questions.length > 0) {
              // Store questions in sessionStorage
              sessionStorage.setItem(
                "quiz_questions",
                JSON.stringify(questions)
              );

              // Make sure the isComplete flag is set properly
              sessionStorage.setItem("quiz_complete", isComplete.toString());

              // Only navigate to question page on first call (when first question is ready)
              if (!isComplete) {
                // Navigate to quiz page
                router.push("/quiz/question");
              } else {
                // If we already navigated, just update the stored data
                // This ensures the storage event is triggered
                const existingData = sessionStorage.getItem("quiz_questions");
                if (existingData) {
                  // Force a storage event by setting with the same key
                  sessionStorage.setItem(
                    "quiz_questions",
                    JSON.stringify(questions)
                  );
                  sessionStorage.setItem("quiz_complete", "true");

                  // Explicitly trigger a storage event for the current window
                  window.dispatchEvent(new Event("storage"));
                }
              }
            }
          },
          (error) => {
            console.error("Error generating questions:", error);
            // TODO: Handle error state
          }
        );
      } catch (error) {
        console.error("Error starting quiz:", error);
        // TODO: Handle error state
      }
    };

    startQuizGeneration();
  }, [topic, questionCount, difficulty, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Generating Your Trivia Challenge
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-32 h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xl font-semibold text-purple-600">
                {Math.min(progress.current, progress.total)}/{progress.total}
              </div>
            </div>
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-purple-600"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                strokeDasharray={`${
                  (Math.min(progress.current, progress.total) /
                    progress.total) *
                  251.2
                } 251.2`}
                strokeDashoffset="0"
              />
            </svg>
          </div>

          <div className="text-xl text-gray-700 animate-pulse">
            {progress.current === 0
              ? "Crafting your first question..."
              : progress.current === 1
              ? "First question ready! Fetching the rest..."
              : `Fetching remaining questions... (${progress.current}/${progress.total})`}
          </div>

          <div className="text-sm text-gray-500 mt-2">
            {topic && <span>Topic: {topic}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback for when the component is loading
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white text-center">
        <h1 className="text-2xl font-bold mb-6">Generating Questions...</h1>

        <div className="flex justify-center mb-8">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
}

// Main export that uses Suspense
export default function LoadingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoadingContent />
    </Suspense>
  );
}
