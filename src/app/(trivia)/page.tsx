"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopicSelector } from "@/components/TopicSelector";
import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { LoadingModal } from "@/components/LoadingModal";
import { ScrollingTopics } from "@/components/ScrollingTopics";
import { QUIZ_CONSTANTS, DifficultyLevel } from "@/lib/quiz";
import { generateQuestionsSequentially } from "@/services/questionService";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.NORMAL
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async () => {
    setHasError(false);
    // Clear any stored quiz data
    sessionStorage.removeItem("quiz_questions");
    sessionStorage.removeItem("quiz_complete");

    setIsGenerating(true);
    setProgress({ current: 0, total: questionCount });

    try {
      await generateQuestionsSequentially(
        {
          topic,
          questionCount,
          difficulty,
        },
        ({ questions, isComplete }) => {
          // Update progress
          setProgress({ current: questions.length, total: questionCount });

          // Store questions in sessionStorage
          sessionStorage.setItem("quiz_questions", JSON.stringify(questions));

          // Make sure the isComplete flag is set properly
          sessionStorage.setItem("quiz_complete", isComplete.toString());

          // Only navigate to question page on first call (when first question is ready)
          if (!isComplete && questions.length === 1) {
            router.push("/quiz/question");
          }
        },
        (error) => {
          console.error("Error generating questions:", error);
          setHasError(true);
          setProgress({ current: 0, total: questionCount }); // Reset progress
        }
      );
    } catch (error) {
      console.error("Error starting quiz:", error);
      setHasError(true);
      // Keep modal visible to show error UI
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 p-4 pt-6 rounded-xl shadow-lg bg-[radial-gradient(circle_at_center,theme(colors.purple.600),theme(colors.purple.900))]">
        <h1 className="text-2xl font-bold text-center mb-4 text-white">
          Smarty Pants Trivia!
        </h1>

        <ScrollingTopics onTopicSelect={setTopic} />

        <TopicSelector value={topic} onChange={setTopic} />

        <QuestionCountSelector
          value={questionCount}
          onChange={setQuestionCount}
        />

        <DifficultySelector value={difficulty} onChange={setDifficulty} />

        <button
          onClick={handleSubmit}
          disabled={!topic.trim() || isGenerating}
          className={`
            w-full px-4 py-2 rounded-lg text-white font-medium transition-colors
            ${
              topic.trim() && !isGenerating
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          Let's Go!
        </button>
      </div>

      {isGenerating && (
        <LoadingModal
          currentCount={progress.current}
          totalCount={progress.total}
          topic={topic}
          questionCount={questionCount}
          difficulty={difficulty}
          hasError={hasError}
          onRetry={() => {
            handleSubmit();
          }}
          onCancel={() => {
            setIsGenerating(false);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
