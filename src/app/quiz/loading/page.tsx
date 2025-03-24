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

  useEffect(() => {
    const startQuizGeneration = async () => {
      try {
        const params = { topic, questionCount, difficulty };

        // Initialize question generation
        generateQuestionsSequentially(
          params,
          ({ questions, isComplete }) => {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white text-center">
        <h1 className="text-2xl font-bold mb-6">
          Getting Your Trivia Ready...
        </h1>

        <div className="flex justify-center mb-8">
          <LoadingSpinner />
        </div>

        <div className="space-y-4 text-left">
          <div>
            <span className="font-medium text-lg">Topic:</span>
            <span className="ml-2 capitalize text-lg">{topic}</span>
          </div>
          <div>
            <span className="font-medium text-lg"># of Questions:</span>
            <span className="ml-2 text-lg">{questionCount}</span>
          </div>
          <div>
            <span className="font-medium text-lg">Difficulty:</span>
            <span className="ml-2 capitalize text-lg">{difficulty}</span>
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
