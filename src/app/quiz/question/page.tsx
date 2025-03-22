"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/schemas/question";

export interface QuestionWithShuffledAnswers extends Question {
  shuffledAnswers: string[];
}

export interface AnsweredQuestion {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  showExplanation: boolean;
}

// Move the useTypewriter hook outside the component
const useTypewriter = (text: string, questionIndex: number, speed = 50) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const seenQuestionsRef = useRef<Set<number>>(new Set());

  const startTyping = useCallback(() => {
    if (!text) return;

    if (seenQuestionsRef.current.has(questionIndex)) {
      // If we've seen this question before, show it immediately
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentText = "";
    let index = 0;

    const type = () => {
      if (index < text.length) {
        currentText += text.charAt(index);
        setDisplayedText(currentText);
        index++;
        setTimeout(type, speed);
      } else {
        setIsTyping(false);
        seenQuestionsRef.current.add(questionIndex);
      }
    };

    // Start typing immediately
    type();
  }, [text, speed, questionIndex]);

  useEffect(() => {
    if (text) {
      // Only start typing if there is text to type
      startTyping();
    }
  }, [text, startTyping]);

  return { displayedText, isTyping };
};

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
  const { displayedText: typedQuestion, isTyping } = useTypewriter(
    currentQuestion?.question || "",
    currentQuestionIndex,
    30
  );

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

    const newAnsweredQuestions = [
      ...answeredQuestions,
      {
        questionIndex: currentQuestionIndex,
        selectedAnswer,
        isCorrect,
        showExplanation: true,
      },
    ];
    setAnsweredQuestions(newAnsweredQuestions);

    // Store in session storage
    sessionStorage.setItem(
      "quiz_answers",
      JSON.stringify(
        newAnsweredQuestions.map(
          ({ questionIndex, selectedAnswer, isCorrect }) => ({
            questionIndex,
            selectedAnswer,
            isCorrect,
          })
        )
      )
    );

    // If all questions are answered, redirect to summary
    if (newAnsweredQuestions.length === questions.length) {
      router.push("/quiz/summary");
    }
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
            className="px-4 py-2 rounded border-1 border-white transition-colors bg-purple-800 hover:bg-purple-700 disabled:bg-gray-600 disabled:hover:bg-gray-600"
          >
            Back
          </button>
          <div>
            Question {currentQuestionIndex + 1} of {questions.length}
            {isLoadingMore && " (Loading more...)"}
          </div>
          <button
            onClick={() => handleNavigation("forward")}
            disabled={
              currentQuestionIndex === questions.length - 1 ||
              !answeredQuestions.some(
                (q) => q.questionIndex === currentQuestionIndex
              )
            }
            className={`px-4 py-2 rounded border-1 border-white transition-colors
              ${
                answeredQuestions.some(
                  (q) => q.questionIndex === currentQuestionIndex
                ) && currentQuestionIndex < questions.length - 1
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-purple-800 hover:bg-purple-700"
              }
              disabled:bg-gray-600 disabled:hover:bg-gray-600`}
          >
            Next
          </button>
        </div>

        {/* Question */}
        <div className="text-xl mb-8">
          {typedQuestion}
          {isTyping && (
            <span className="ml-1 animate-[pulse_1s_ease-in-out_infinite]">
              |
            </span>
          )}
        </div>

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
                  w-full p-4 rounded-lg text-left transition-all
                  border-1 border-white
                  ${
                    isSelected ? "shadow-[0_0_10px_5px_rgba(59,130,246,1)]" : ""
                  }
                  ${
                    showResult
                      ? isCorrect
                        ? "bg-green-700"
                        : answer === answeredQuestion?.selectedAnswer
                        ? "bg-orange-700"
                        : "bg-purple-900"
                      : "bg-purple-900 hover:bg-purple-700"
                  }
                `}
              >
                {`${String.fromCharCode(65 + index)}: ${answer}`}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        {!answeredQuestion && (
          <button
            onClick={handleConfirmAnswer}
            disabled={!selectedAnswer}
            className={`w-full mt-6 px-6 py-3 rounded-lg border-0 border-white ${
              selectedAnswer ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700"
            } disabled:opacity-50`}
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
