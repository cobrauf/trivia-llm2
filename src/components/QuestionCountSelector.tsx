import { useState, useEffect } from "react";
import { QUIZ_CONSTANTS } from "@/lib/quiz";

interface QuestionCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuestionCountSelector({
  value,
  onChange,
}: QuestionCountSelectorProps) {
  const [inputValue, setInputValue] = useState<string>(value.toString()); // Local state for the input

  // Sync local state with prop value when it changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, QUIZ_CONSTANTS.MAX_QUESTIONS);
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, QUIZ_CONSTANTS.MIN_QUESTIONS);
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Allow typing any value, even if invalid
  };

  const handleBlur = () => {
    const parsedValue = parseInt(inputValue, 10);
    if (isNaN(parsedValue)) {
      // If the input is empty or invalid, reset to the minimum
      setInputValue(QUIZ_CONSTANTS.MIN_QUESTIONS.toString());
      onChange(QUIZ_CONSTANTS.MIN_QUESTIONS);
    } else {
      // Clamp the value to the allowed range
      const clampedValue = Math.min(
        Math.max(parsedValue, QUIZ_CONSTANTS.MIN_QUESTIONS),
        QUIZ_CONSTANTS.MAX_QUESTIONS
      );
      setInputValue(clampedValue.toString());
      onChange(clampedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur(); // Validate and clamp the value when Enter is pressed
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="questionCount"
        className="block text-sm font-medium mb-1 text-purple-200"
      >
        Number of Questions
      </label>
      <div className="flex gap-2">
        <button
          onClick={handleDecrement}
          className="flex-1 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-900/50 hover:bg-purple-700/50 active:bg-purple-600 text-white text-lg font-bold transition-colors"
          aria-label="Decrease question count"
        >
          -
        </button>
        <input
          type="number"
          id="questionCount"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={QUIZ_CONSTANTS.MIN_QUESTIONS}
          max={QUIZ_CONSTANTS.MAX_QUESTIONS}
          className="flex-1 text-center px-2 py-2 rounded-lg border border-purple-500/20 bg-purple-900/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleIncrement}
          className="flex-1 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-900/50 hover:bg-purple-700/50 active:bg-purple-600 text-white text-lg font-bold transition-colors"
          aria-label="Increase question count"
        >
          +
        </button>
      </div>
      <p className="text-xs text-purple-300/70 mt-1">
        Min: {QUIZ_CONSTANTS.MIN_QUESTIONS}, Max: {QUIZ_CONSTANTS.MAX_QUESTIONS}{" "}
        questions
      </p>
    </div>
  );
}
