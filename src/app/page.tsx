"use client";

import { useState } from "react";
import { TopicSelector } from "@/components/TopicSelector";
import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { QUIZ_CONSTANTS } from "@/constants/quiz";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(
    QUIZ_CONSTANTS.MAX_QUESTIONS
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  const handleSubmit = () => {
    // Will be implemented later
    console.log({ topic, questionCount, difficulty });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 p-8 rounded-xl shadow-lg bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900">
        <h1 className="text-2xl font-bold text-center mb-8">
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
          Generate Quiz
        </button>
      </div>
    </div>
  );
}
