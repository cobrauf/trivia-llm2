"use client";
import { useState, useEffect } from "react";

interface LoadingModalProps {
  currentCount: number;
  totalCount: number;
  topic: string;
  questionCount: number;
  difficulty: string;
  onRetry?: () => void;
  onCancel?: () => void;
  hasError?: boolean;
  status?: "connecting" | "generating";
}

const LoadingSpinner = () => (
  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

export function LoadingModal({
  currentCount,
  totalCount,
  topic,
  questionCount,
  difficulty,
  onRetry,
  onCancel,
  hasError = false,
  status,
}: LoadingModalProps) {
  const [showTimeoutButtons, setShowTimeoutButtons] = useState(false);

  useEffect(() => {
    if (hasError) {
      setShowTimeoutButtons(true);
      return;
    }

    setShowTimeoutButtons(false); // Reset timeout state when retrying
    const timeoutId = setTimeout(() => {
      setShowTimeoutButtons(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timeoutId);
  }, [currentCount, hasError]); // Reset timer when currentCount changes or error occurs

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md space-y-8 p-8 ml-4 mr-4 rounded-xl bg-[radial-gradient(circle_at_center,theme(colors.purple.600),theme(colors.purple.900))] text-white text-center">
        <h2 className="text-lg font-bold mb-6">Preparing Your Trivia...</h2>

        <div className="flex justify-center mb-8">
          {showTimeoutButtons ? (
            <div className="text-red-300">
              (We're having trouble connecting, please try again)
            </div>
          ) : (
            <div className="space-y-2">
              <LoadingSpinner />
              {status && (
                <div className="text-sm text-purple-200">
                  {status === "connecting"
                    ? "Connecting to service..."
                    : "Generating questions..."}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1 text-center">
          <div>
            <span className="font-medium">Topic:</span>
            <span className="ml-2">{topic}</span>
          </div>
          <div>
            <span className="font-medium">Questions:</span>
            <span className="ml-2">{questionCount}</span>
          </div>
          <div>
            <span className="font-medium">Difficulty:</span>
            <span className="ml-2 capitalize">{difficulty}</span>
          </div>
          {/* <div className="text-center text-sm text-purple-200">
            {currentCount > 0 && currentCount < totalCount && (
              <div>
                Fetching remaining questions... {currentCount}/{totalCount}
              </div>
            )}
          </div> */}

          {showTimeoutButtons && (
            <div className="mt-6 flex justify-center gap-4">
              {/* <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Retry
              </button> */}
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
