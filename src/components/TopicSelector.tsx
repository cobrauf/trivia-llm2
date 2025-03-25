import { ChangeEvent, useRef, useState, useEffect } from "react";

interface TopicSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 50;

function useTypewriterPlaceholder(text: string, speed: number = 50) {
  const [placeholder, setPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    let direction = 1; // 1 for typing, -1 for backspacing

    const typeCharacter = () => {
      if (direction === 1) {
        if (currentIndex < text.length) {
          setPlaceholder(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          // Start backspacing after a pause
          setTimeout(() => {
            direction = -1;
          }, 2000000);
        }
      } else {
        if (currentIndex > 0) {
          setPlaceholder(text.slice(0, currentIndex - 1));
          currentIndex--;
        } else {
          // Start typing again after a short pause
          setTimeout(() => {
            direction = 1;
          }, 1000);
        }
      }
    };

    const interval = setInterval(typeCharacter, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return placeholder;
}

export function TopicSelector({ value, onChange }: TopicSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const placeholder = useTypewriterPlaceholder(
    "Enter any topic (e.g. video games)"
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
      <div className="relative">
        <input
          type="text"
          id="topic"
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={MAX_LENGTH}
          placeholder=""
          className={`w-full px-3 py-3 text-sm rounded-lg border bg-purple-900/50 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:border-transparent ${
            charactersRemaining <= 0
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {!isFocused && !value && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-purple-300">
            {placeholder}
            <span className="ml-0.5 animate-pulse">|</span>
          </div>
        )}
      </div>
    </div>
  );
}
