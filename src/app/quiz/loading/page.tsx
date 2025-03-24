"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add a ref to track if we've already started generation
  const generationStartedRef = useRef(false);

  // Add debug info
  const addDebugInfo = useCallback((info: string) => {
    console.log("Debug:", info);
    setDebugInfo((prev) => [...prev.slice(-4), info]); // Keep last 5 messages
  }, []);

  useEffect(() => {
    const startQuizGeneration = async () => {
      // Prevent multiple requests
      if (generationStartedRef.current) {
        addDebugInfo("Generation already started, skipping");
        return;
      }

      generationStartedRef.current = true;

      try {
        addDebugInfo("Starting quiz generation");
        const params = { topic, questionCount, difficulty };

        // Store the total question count for progress indication
        sessionStorage.setItem(
          "quiz_questions_total",
          questionCount.toString()
        );

        // Clear previous questions and state
        sessionStorage.removeItem("quiz_questions");
        sessionStorage.removeItem("quiz_complete");
        sessionStorage.removeItem("quiz_navigation_started");

        // Initialize question generation for all questions at once
        generateQuestionsSequentially(
          params,
          ({ questions, isComplete, progress }) => {
            // Update progress if available
            if (progress) {
              setProgress(progress);
              addDebugInfo(
                `Progress update: ${progress.current}/${progress.total} questions`
              );
            }

            // When we have questions, store them
            if (questions.length > 0) {
              addDebugInfo(`Received ${questions.length} questions`);

              // Store questions in sessionStorage
              sessionStorage.setItem(
                "quiz_questions",
                JSON.stringify(questions)
              );

              // Make sure the isComplete flag is set properly
              sessionStorage.setItem("quiz_complete", isComplete.toString());

              // Navigate to question page once we have the first question
              // This happens only the first time
              if (
                !sessionStorage.getItem("quiz_navigation_started") &&
                questions.length > 0
              ) {
                sessionStorage.setItem("quiz_navigation_started", "true");
                addDebugInfo("Navigating to question page");

                // Short delay to ensure state is saved before navigation
                setTimeout(() => {
                  router.push("/quiz/question");
                }, 100);
              } else {
                // For subsequent updates, just update the stored data
                addDebugInfo(
                  `Updating questions: ${questions.length} total, complete: ${isComplete}`
                );

                // Explicitly trigger a storage event for the current window
                window.dispatchEvent(new Event("storage"));
              }
            } else {
              addDebugInfo("No questions received yet");
            }
          },
          (error) => {
            generationStartedRef.current = false; // Reset on error
            console.error("Error generating questions:", error);
            setError(error);
            addDebugInfo(`Error: ${error}`);
          }
        );
      } catch (error) {
        generationStartedRef.current = false; // Reset on error
        console.error("Error starting quiz:", error);
        setError(
          `Error starting quiz: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        addDebugInfo(`Start error: ${error}`);
      }
    };

    startQuizGeneration();
  }, [topic, questionCount, difficulty, router, addDebugInfo]);

  // If there's an error, show it
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-red-600">
            Error Generating Questions
          </h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <button
            onClick={() => router.replace("/")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            Go Back
          </button>

          {debugInfo.length > 0 && (
            <div className="mt-6 text-left">
              <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
              <div className="bg-gray-100 p-3 rounded text-xs">
                {debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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

          {/* Show debug info in development */}
          {debugInfo.length > 0 && (
            <div className="mt-4 text-left w-full max-w-md">
              <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-24">
                {debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}
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
