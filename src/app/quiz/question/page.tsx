"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/schemas/question";
import { ConfirmationModal } from "@/components/ConfirmationModal";

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

    // Show text immediately if we've seen this question before
    if (seenQuestionsRef.current.has(questionIndex)) {
      setDisplayedText(text);
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
  const [showLoadedMessage, setShowLoadedMessage] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashCount, setFlashCount] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      setShowBackConfirmation(true);
      // Push a new state to prevent immediate back navigation
      window.history.pushState(null, "", window.location.pathname);
    };

    // Push initial state
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const handleBackConfirm = () => {
    setShowBackConfirmation(false);
    router.push("/");
    // Clear all quiz-related session storage
    sessionStorage.removeItem("quiz_questions");
    sessionStorage.removeItem("quiz_shuffled_questions");
    sessionStorage.removeItem("quiz_answers");
    sessionStorage.removeItem("quiz_complete");
    sessionStorage.removeItem("quiz_questions_total");
    // Force a page reload to clear any lingering state
    window.location.reload();
  };

  const handleBackCancel = () => {
    setShowBackConfirmation(false);
  };

  useEffect(() => {
    // Load questions from sessionStorage
    const storedQuestions = sessionStorage.getItem("quiz_questions");
    const isComplete = sessionStorage.getItem("quiz_complete") === "true";

    if (!storedQuestions) {
      router.replace("/"); // Go back to start if no questions found
      return;
    }

    const parsedQuestions = JSON.parse(storedQuestions) as Question[];

    // Check if we already have shuffled answers in session storage
    const storedShuffledQuestions = sessionStorage.getItem(
      "quiz_shuffled_questions"
    );

    if (storedShuffledQuestions) {
      // Use the previously shuffled questions to maintain consistent order
      setQuestions(JSON.parse(storedShuffledQuestions));
    } else {
      // First time loading - randomize answers for each question
      const questionsWithRandomizedAnswers: QuestionWithShuffledAnswers[] =
        parsedQuestions.map((q) => ({
          ...q,
          shuffledAnswers: [q.correctAnswer, ...q.incorrectAnswers].sort(
            () => Math.random() - 0.5
          ),
        }));

      setQuestions(questionsWithRandomizedAnswers);
      // Store the shuffled questions to maintain consistency
      sessionStorage.setItem(
        "quiz_shuffled_questions",
        JSON.stringify(questionsWithRandomizedAnswers)
      );
    }

    setIsLoadingMore(!isComplete);
  }, [router]);

  // Add a listener for storage changes to detect when remaining questions are loaded
  useEffect(() => {
    const handleStorageChange = () => {
      const isComplete = sessionStorage.getItem("quiz_complete") === "true";
      const storedQuestions = sessionStorage.getItem("quiz_questions");

      // Update the loading status if needed
      if (isComplete && isLoadingMore) {
        setIsLoadingMore(false);
      }

      // Update questions with any new ones that have been added
      if (storedQuestions) {
        try {
          console.log("Storage changed, checking for new questions");
          const parsedQuestions = JSON.parse(storedQuestions) as Question[];

          // Debug log
          console.log("Current questions count:", questions.length);
          console.log("Stored questions count:", parsedQuestions.length);

          // Only update if there are questions in storage
          if (parsedQuestions.length > 0) {
            console.log(
              "Updating questions from storage, new count:",
              parsedQuestions.length,
              "old count:",
              questions.length
            );

            // Check if we have more questions than before
            if (parsedQuestions.length > questions.length) {
              // Get the existing shuffled questions
              const existingShuffledQuestions = [...questions];

              // Only shuffle the new questions
              const newQuestions = parsedQuestions.slice(questions.length);
              const newShuffledQuestions: QuestionWithShuffledAnswers[] =
                newQuestions.map((q) => ({
                  ...q,
                  shuffledAnswers: [
                    q.correctAnswer,
                    ...q.incorrectAnswers,
                  ].sort(() => Math.random() - 0.5),
                }));

              // Combine existing and new questions
              const combinedQuestions = [
                ...existingShuffledQuestions,
                ...newShuffledQuestions,
              ];

              // Update the state and storage
              setQuestions(combinedQuestions);
              sessionStorage.setItem(
                "quiz_shuffled_questions",
                JSON.stringify(combinedQuestions)
              );

              // Show a notification about new questions
              setShowLoadedMessage(true);
              setTimeout(() => {
                setShowLoadedMessage(false);
              }, 10000);
            }
          }
        } catch (error) {
          console.error("Error parsing stored questions:", error);
        }
      }
    };

    // Check initially
    handleStorageChange();

    // Add event listener for storage events
    window.addEventListener("storage", handleStorageChange);

    // Setup polling as a fallback since storage events don't fire in the same tab
    const intervalId = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [questions.length, isLoadingMore]);

  useEffect(() => {
    if (!isLoadingMore && questions.length > 1) {
      setShowLoadedMessage(true);
    }
  }, [isLoadingMore, questions.length]);

  const currentQuestion = questions[currentQuestionIndex];
  const { displayedText: typedQuestion, isTyping } = useTypewriter(
    currentQuestion?.question || "",
    currentQuestionIndex,
    20
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
    setIsCorrectAnswer(isCorrect);

    // Start the flashing effect
    setIsFlashing(true);
    setFlashCount(0);

    // Flash 3 times (6 transitions total - 3 to flash color, 3 back to original)
    const flashInterval = setInterval(() => {
      setFlashCount((count) => {
        if (count >= 5) {
          clearInterval(flashInterval);
          setIsFlashing(false);

          // After flashing completes, update the answered questions state
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

          // Check if we need to update the loading status
          const isComplete = sessionStorage.getItem("quiz_complete") === "true";
          if (isComplete && isLoadingMore) {
            setIsLoadingMore(false);
          }

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

          // We don't need to update the quiz_questions here as it would cause reshuffling
          // Just keep our already shuffled questions in storage
          sessionStorage.setItem(
            "quiz_shuffled_questions",
            JSON.stringify(questions)
          );

          return 0;
        }
        return count + 1;
      });
    }, 200); // 200ms per transition = 1.2 seconds total for 3 flashes
  };

  const handleNavigation = (direction: "back" | "forward") => {
    if (direction === "back" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
    } else if (
      direction === "forward" &&
      answeredQuestions.some((q) => q.questionIndex === currentQuestionIndex)
    ) {
      // Check if we need to update the loading status
      const isComplete = sessionStorage.getItem("quiz_complete") === "true";
      if (isComplete && isLoadingMore) {
        setIsLoadingMore(false);
      }

      if (currentQuestionIndex === questions.length - 1 && !isLoadingMore) {
        router.push("/quiz/summary");
      } else if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      }
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
      <div className="w-full max-w-2xl mt-0 p-6 pt-4 rounded-xl bg-[radial-gradient(circle_at_center,theme(colors.purple.700),theme(colors.purple.900))] text-white">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-0">
          <button
            onClick={() => handleNavigation("back")}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-1 rounded border-0 border-white transition-colors bg-purple-900 hover:bg-purple-700 disabled:bg-gray-500"
          >
            &lt; Prev
          </button>
          <div className="text-center text-sm">
            {/* <div>Question</div> */}
            <div>
              # {currentQuestionIndex + 1} of{" "}
              {parseInt(
                sessionStorage.getItem("quiz_questions_total") ||
                  String(questions.length)
              )}
            </div>
          </div>
          <button
            onClick={() => handleNavigation("forward")}
            disabled={
              !answeredQuestions.some(
                (q) => q.questionIndex === currentQuestionIndex
              )
            }
            className={`px-4 py-1 rounded border-0 border-white transition-colors
              ${
                answeredQuestions.some(
                  (q) => q.questionIndex === currentQuestionIndex
                )
                  ? currentQuestionIndex === questions.length - 1 &&
                    !isLoadingMore
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-blue-500 hover:bg-blue-600"
                  : "bg-purple-800 hover:bg-purple-700"
              }
              disabled:bg-gray-600 disabled:hover:bg-gray-600`}
          >
            {answeredQuestions.some(
              (q) => q.questionIndex === currentQuestionIndex
            ) &&
            currentQuestionIndex === questions.length - 1 &&
            !isLoadingMore
              ? "Score"
              : "Next >"}
          </button>
        </div>

        {/* Loading indicator for remaining questions */}
        {isLoadingMore && (
          <div className="text-center text-xs text-purple-200 flex items-center justify-center mb-2">
            <div className="animate-spin mr-2 h-2 w-2 border-2 border-purple-200 rounded-full border-t-transparent"></div>
            Fetching remaining questions...
            {/* ({questions.length}/
            {sessionStorage.getItem("quiz_questions_total") || "..."}) */}
          </div>
        )}
        {/* Show message when finished loading */}
        {!isLoadingMore && questions.length > 1 && showLoadedMessage && (
          <div className="text-center text-xs text-green-300 mb-2">
            ✓ All {questions.length} questions generated
          </div>
        )}

        {/* Question */}
        <div className="h-[120px] mb-1 mt-4 flex items-start justify-left">
          <div
            className={`text-left transition-all ${
              typedQuestion.length > 150
                ? "text-base"
                : typedQuestion.length > 50
                ? "text-lg"
                : "text-lg"
            }`}
            // className="text-left transition-all text-lg"
          >
            {typedQuestion}
            {isTyping && (
              <span className="ml-1 animate-[pulse_1s_ease-in-out_infinite]">
                |
              </span>
            )}
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-4">
          {allAnswers.map((answer, index) => {
            const isSelected = answer === selectedAnswer;
            const showResult = answeredQuestion !== undefined;
            const isCorrect = answer === currentQuestion.correctAnswer;

            // Flash colors logic
            let backgroundColor = "bg-purple-900 hover:bg-purple-700";

            if (showResult) {
              if (isCorrect) {
                backgroundColor = "bg-green-600";
              } else if (answer === answeredQuestion?.selectedAnswer) {
                backgroundColor = "bg-red-600";
              } else {
                backgroundColor = "bg-purple-900";
              }
            } else if (isFlashing && isSelected) {
              // Flashing logic - alternate between colors on even/odd counts
              if (isCorrectAnswer) {
                // Correct answer: flash between purple and green
                backgroundColor =
                  flashCount % 2 === 0 ? "bg-purple-900" : "bg-green-600";
              } else {
                // Wrong answer: flash between red and green
                backgroundColor =
                  flashCount % 2 === 0 ? "bg-red-600" : "bg-purple-900";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(answer)}
                disabled={answeredQuestion !== undefined || isFlashing}
                className={`
                  w-full p-4 rounded-lg text-left transition-all
                  border-1 border-white
                  ${
                    isSelected ? "shadow-[0_0_10px_5px_rgba(59,130,246,1)]" : ""
                  }
                  ${backgroundColor}
                `}
              >
                {`${String.fromCharCode(65 + index)}: ${answer}`}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        {!answeredQuestion && !isFlashing && (
          <button
            onClick={handleConfirmAnswer}
            disabled={!selectedAnswer}
            className={`w-full mt-6 px-6 py-3 rounded-lg border-0 border-white ${
              selectedAnswer ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700"
            } disabled:opacity-50`}
          >
            Final Answer
          </button>
        )}

        {/* Show a message while flashing */}
        {isFlashing && (
          <div className="w-full mt-6 px-6 py-3 text-center">
            Checking answer...
          </div>
        )}

        {/* Explanation */}
        {answeredQuestion?.showExplanation && (
          <div className="mt-6 p-4 rounded-lg bg-purple-900">
            <div className="font-semibold mb-2">
              {answeredQuestion.isCorrect ? "Correct! 🎉" : "Incorrect"}
            </div>
            <div>{currentQuestion.explanation}</div>
          </div>
        )}

        {/* Question Back Navigation */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowBackConfirmation(true)}
            className="px-4 py-0 text-xs rounded border-0 border-white transition-colors bg-purple-0 hover:bg-purple-900 disabled:bg-gray-600 disabled:hover:bg-gray-600"
          >
            ← Back to trivia setup
          </button>
        </div>

        {/* Back to Welcome button */}
        {/* <button
          onClick={() => setShowBackConfirmation(true)}
          className="fixed top-3 left-4 px-2 bg-blue hover:bg-purple-900 text-white rounded-md transition-colors"
        >
          ← Back
        </button> */}
      </div>

      {/* Back Navigation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBackConfirmation}
        message="Go back to trivia config? Progress will be lost."
        onConfirm={handleBackConfirm}
        onCancel={handleBackCancel}
      />
    </div>
  );
}
