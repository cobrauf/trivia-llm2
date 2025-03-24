"use client";

interface LoadingModalProps {
  currentCount: number;
  totalCount: number;
  topic: string;
  questionCount: number;
  difficulty: string;
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
}: LoadingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md space-y-8 p-8 ml-8 mr-8 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white text-center">
        <h2 className="text-lg font-bold mb-6">Preparing Your Questions...</h2>

        <div className="flex justify-center mb-8">
          <LoadingSpinner />
        </div>

        <div className="space-y-4 text-center">
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
          <div className="text-center text-sm text-purple-200">
            {currentCount > 0 && currentCount < totalCount && (
              <div>
                Fetching remaining questions... {currentCount}/{totalCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
