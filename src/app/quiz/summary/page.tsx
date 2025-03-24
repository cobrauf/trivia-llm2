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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedQuestions = sessionStorage.getItem("quiz_questions");
    const storedAnswers = sessionStorage.getItem("quiz_answers");

    if (!storedQuestions || !storedAnswers) {
      router.replace("/");
      return;
    }

    try {
      const parsedQuestions = JSON.parse(storedQuestions);
      const parsedAnswers = JSON.parse(storedAnswers);
      setQuestions(parsedQuestions);
      setAnsweredQuestions(parsedAnswers);
    } catch (error) {
      console.error("Error parsing stored data:", error);
      router.replace("/");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading || questions.length === 0 || answeredQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const score = answeredQuestions.filter((q) => q.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 p-2 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white">
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold mb-0">Trivia Complete!</h1>
          <div className="text-base">
            Score: {score} / {totalQuestions} ({percentage}%)
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-purple-400 [&::-webkit-scrollbar-track]:bg-purple-900">
          {questions.map((question, index) => {
            const answer = answeredQuestions[index];
            return (
              <div key={index} className="p-3 rounded-lg bg-purple-900">
                <div className="font-medium text-sm mb-2">
                  Question {index + 1}: {question.question}
                </div>
                <div className="space-y-1.5 mt-3">
                  {(
                    question.shuffledAnswers || [
                      question.correctAnswer,
                      ...question.incorrectAnswers,
                    ]
                  ).map((ans, i) => {
                    const isUserAnswer = ans === answer.selectedAnswer;
                    const isCorrectAnswer = ans === question.correctAnswer;
                    const showBorder =
                      isUserAnswer || (isCorrectAnswer && !answer.isCorrect);
                    const borderColor = isCorrectAnswer
                      ? "border-green-600"
                      : "border-red-600";

                    return (
                      <div
                        key={i}
                        className={`flex justify-between items-center px-3 py-1.5 rounded text-sm ${
                          showBorder ? `border-2 ${borderColor}` : ""
                        }`}
                      >
                        <div>{`${String.fromCharCode(65 + i)}: ${ans}`}</div>
                        {isUserAnswer && (
                          <div
                            className={`ml-4 text-xl ${
                              answer.isCorrect
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {answer.isCorrect ? "✓" : "✗"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full px-6 py-3 rounded-lg border-0 border-white bg-blue-600 hover:bg-blue-700"
        >
          Start New Round
        </button>
      </div>
    </div>
  );
}
