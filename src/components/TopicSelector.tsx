import { ChangeEvent, useRef } from "react";

interface TopicSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 50;

export function TopicSelector({ value, onChange }: TopicSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // When Enter is pressed, blur the input to hide the keyboard
      inputRef.current?.blur();
    }
  };

  const charactersRemaining = MAX_LENGTH - value.length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="topic" className="text-sm font-medium text-purple-200">
          Topic
        </label>
        <span
          className={`text-xs ${
            charactersRemaining <= 5 ? "text-red-300" : "text-purple-300/70"
          }`}
        >
          {charactersRemaining} characters remaining
        </span>
      </div>
      <input
        type="text"
        id="topic"
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={MAX_LENGTH}
        placeholder="Enter any topic (e.g. Animals)"
        className={`w-full px-3 py-3 text-sm rounded-lg border bg-purple-900/50 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:border-transparent ${
          charactersRemaining <= 0
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
    </div>
  );
}
