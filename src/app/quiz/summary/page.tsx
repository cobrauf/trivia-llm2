"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/schemas/question";
import type { QuestionWithShuffledAnswers } from "../question/page";

interface AnsweredQuestion {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export default function QuizSummaryPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithShuffledAnswers[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);

  useEffect(() => {
    const storedQuestions = sessionStorage.getItem("quiz_questions");
    const storedAnswers = sessionStorage.getItem("quiz_answers");

    if (!storedQuestions || !storedAnswers) {
      router.replace("/");
      return;
    }

    setQuestions(JSON.parse(storedQuestions));
    setAnsweredQuestions(JSON.parse(storedAnswers));
  }, [router]);

  const score = answeredQuestions.filter((q) => q.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 p-8 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>
          <div className="text-xl">
            Score: {score} / {totalQuestions} ({percentage}%)
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-4">
          {questions.map((question, index) => {
            const answer = answeredQuestions[index];
            return (
              <div key={index} className="p-4 rounded-lg bg-purple-800/50">
                <div className="font-semibold mb-2">
                  Question {index + 1}: {question.question}
                </div>
                <div
                  className={`pl-4 ${
                    answer.isCorrect ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  Your answer: {answer.selectedAnswer}
                </div>
                {!answer.isCorrect && (
                  <div className="pl-4 text-green-400">
                    Correct answer: {question.correctAnswer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-6 px-6 py-3 rounded-lg border-2 border-white bg-purple-800 hover:bg-purple-700"
        >
          Start New Quiz
        </button>
      </div>
    </div>
  );
}
