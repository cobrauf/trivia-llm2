"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopicSelector } from "@/components/TopicSelector";
import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { QUIZ_CONSTANTS, DifficultyLevel } from "@/lib/quiz";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(
    QUIZ_CONSTANTS.MAX_QUESTIONS
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.PRO
  );

  const handleSubmit = () => {
    // Clear any stored quiz data
    sessionStorage.removeItem("quiz_questions");
    sessionStorage.removeItem("quiz_complete");

    // Redirect to loading page with quiz parameters
    const params = new URLSearchParams({
      topic,
      questionCount: questionCount.toString(),
      difficulty,
    });

    router.push(`/quiz/loading?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 p-8 rounded-xl shadow-lg bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900">
        <h1 className="text-2xl font-bold text-center mb-8 text-white">
          Trivia Configuration
        </h1>

        <TopicSelector value={topic} onChange={setTopic} />

        <QuestionCountSelector
          value={questionCount}
          onChange={setQuestionCount}
        />

        <DifficultySelector value={difficulty} onChange={setDifficulty} />

        <button
          onClick={handleSubmit}
          disabled={!topic.trim()}
          className={`
            w-full px-4 py-2 rounded-lg text-white font-medium transition-colors
            ${
              topic.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
