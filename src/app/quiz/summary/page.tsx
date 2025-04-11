"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/schemas/question";
import type { QuestionWithShuffledAnswers } from "../question/page";
import { EmailModal } from "@/components/EmailModal";
import { EmailService } from "@/services/emailService";

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
  const [topic, setTopic] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const storedQuestions = sessionStorage.getItem("quiz_questions");
    const storedAnswers = sessionStorage.getItem("quiz_answers");
    const storedTopic = sessionStorage.getItem("quiz_topic");

    if (!storedQuestions || !storedAnswers) {
      router.replace("/");
      return;
    }

    try {
      const parsedQuestions = JSON.parse(storedQuestions);
      const parsedAnswers = JSON.parse(storedAnswers);
      setQuestions(parsedQuestions);
      setAnsweredQuestions(parsedAnswers);
      if (storedTopic) {
        setTopic(storedTopic);
      } else {
        // If no topic in session storage, try to get it from the first question
        if (parsedQuestions.length > 0 && parsedQuestions[0].topic) {
          setTopic(parsedQuestions[0].topic);
        } else {
          setTopic("General Knowledge"); // Last resort fallback
        }
      }
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

  const handleSendEmail = async (email: string) => {
    try {
      const payload = {
        topic,
        questions,
        userAnswers: answeredQuestions.map(
          ({ questionIndex, selectedAnswer, isCorrect }) => ({
            questionIndex,
            selectedAnswer,
            isCorrect,
          })
        ),
        summary: {
          score,
          totalQuestions,
          percentage,
        },
        recipientEmail: email,
      };

      await EmailService.sendTriviaResults(payload);
      setSendError(null);
    } catch (error) {
      console.error("Failed to send email:", error);
      setSendError(
        error instanceof Error ? error.message : "Failed to send email"
      );
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 p-2 rounded-xl bg-[radial-gradient(circle_at_center,theme(colors.purple.600),theme(colors.purple.900))] text-white">
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold mb-0">Trivia Complete!</h1>
          <div className="text-sm mb-1 text-purple-200">Topic: {topic}</div>
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

        <div className="flex gap-4  max-h-12">
          <button
            onClick={() => router.push("/")}
            className="flex-1 px-6 py-3 rounded-lg border-0 border-white bg-blue-600 hover:bg-blue-700"
          >
            New Game
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex-1 px-6 py-3 rounded-lg border-0 border-white bg-blue-600 hover:bg-blue-700"
          >
            Email Trivia
          </button>
        </div>

        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSendError(null);
          }}
          onSend={handleSendEmail}
        />
      </div>
    </div>
  );
}
