"use client";

import { useState } from "react";
import { TopicSelector } from "@/components/TopicSelector";
import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { QUIZ_CONSTANTS, DifficultyLevel } from "@/constants/quiz";
import { Question } from "@/schemas/question";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(
    QUIZ_CONSTANTS.MAX_QUESTIONS
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.SEASONED
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      // Request initial question
      const initialResponse = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          questionCount,
          difficulty,
        }),
      });

      if (!initialResponse.ok) {
        throw new Error("Failed to fetch initial question");
      }

      const initialData = await initialResponse.json();
      setQuestions(initialData.questions);

      // Request remaining questions
      const remainingResponse = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          questionCount,
          difficulty,
          remaining: true,
        }),
      });

      if (!remainingResponse.ok) {
        throw new Error("Failed to fetch remaining questions");
      }

      const remainingData = await remainingResponse.json();
      setQuestions((prevQuestions) => [
        ...prevQuestions,
        ...remainingData.questions,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
          disabled={!topic.trim() || loading}
          className={`
            w-full px-4 py-2 rounded-lg text-white font-medium transition-colors
            ${
              topic.trim() && !loading
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
        )}

        {questions.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Questions ({questions.length}/{questionCount})
            </h2>
            {questions.map((question, index) => (
              <div key={index} className="p-4 bg-purple-800 rounded-lg">
                <p className="font-medium text-white mb-2">
                  {question.question}
                </p>
                <p className="text-sm text-purple-300">
                  Answers available: {question.incorrectAnswers.length + 1}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
