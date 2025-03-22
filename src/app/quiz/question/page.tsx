"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/schemas/question";

interface QuestionWithShuffledAnswers extends Question {
  shuffledAnswers: string[];
}

interface AnsweredQuestion {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  showExplanation: boolean;
}

export default function QuestionPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithShuffledAnswers[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(true);

  useEffect(() => {
    // Load questions from sessionStorage
    const storedQuestions = sessionStorage.getItem("quiz_questions");
    const isComplete = sessionStorage.getItem("quiz_complete") === "true";

    if (!storedQuestions) {
      router.replace("/"); // Go back to start if no questions found
      return;
    }

    const parsedQuestions = JSON.parse(storedQuestions) as Question[];
    // Randomize answers for each question once when loading
    const questionsWithRandomizedAnswers: QuestionWithShuffledAnswers[] =
      parsedQuestions.map((q) => ({
        ...q,
        shuffledAnswers: [q.correctAnswer, ...q.incorrectAnswers].sort(
          () => Math.random() - 0.5
        ),
      }));

    setQuestions(questionsWithRandomizedAnswers);
    setIsLoadingMore(!isComplete);
  }, [router]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (
      answeredQuestions.find((q) => q.questionIndex === currentQuestionIndex)
    ) {
      return; // Already answered
    }
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setAnsweredQuestions((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        selectedAnswer,
        isCorrect,
        showExplanation: true,
      },
    ]);
  };

  const handleNavigation = (direction: "back" | "forward") => {
    if (direction === "back" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
    } else if (
      direction === "forward" &&
      currentQuestionIndex < questions.length - 1 &&
      answeredQuestions.some((q) => q.questionIndex === currentQuestionIndex)
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const answeredQuestion = answeredQuestions.find(
    (q) => q.questionIndex === currentQuestionIndex
  );

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const allAnswers: string[] = currentQuestion.shuffledAnswers;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 p-8 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleNavigation("back")}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded bg-purple-800 disabled:opacity-50"
          >
            Back
          </button>
          <div>
            Question {currentQuestionIndex + 1} of {questions.length}
            {isLoadingMore && " (Loading more...)"}
          </div>
          <button
            onClick={() => handleNavigation("forward")}
            disabled={currentQuestionIndex === questions.length - 1}
            className="px-4 py-2 rounded bg-purple-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Question */}
        <div className="text-xl mb-8">{currentQuestion.question}</div>

        {/* Answers */}
        <div className="space-y-4">
          {allAnswers.map((answer, index) => {
            const isSelected = answer === selectedAnswer;
            const showResult = answeredQuestion !== undefined;
            const isCorrect = answer === currentQuestion.correctAnswer;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(answer)}
                disabled={answeredQuestion !== undefined}
                className={`
                  w-full p-4 rounded-lg text-left transition-colors
                  ${
                    isSelected
                      ? "border-2 border-blue-400"
                      : "border-2 border-transparent"
                  }
                  ${
                    showResult
                      ? isCorrect
                        ? "bg-green-600"
                        : answer === answeredQuestion?.selectedAnswer
                        ? "bg-red-600"
                        : "bg-purple-800"
                      : "bg-purple-800 hover:bg-purple-700"
                  }
                `}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        {!answeredQuestion && (
          <button
            onClick={handleConfirmAnswer}
            disabled={!selectedAnswer}
            className="w-full mt-6 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
          >
            Confirm Answer
          </button>
        )}

        {/* Explanation */}
        {answeredQuestion?.showExplanation && (
          <div className="mt-6 p-4 rounded-lg bg-purple-800">
            <div className="font-semibold mb-2">
              {answeredQuestion.isCorrect ? "Correct! 🎉" : "Incorrect"}
            </div>
            <div>{currentQuestion.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
