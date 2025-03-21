interface QuestionCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuestionCountSelector({
  value,
  onChange,
}: QuestionCountSelectorProps) {
  const handleIncrement = () => {
    onChange(Math.min(value + 1, 20));
  };

  const handleDecrement = () => {
    onChange(Math.max(value - 1, 5));
  };

  return (
    <div className="w-full">
      <label htmlFor="questionCount" className="block text-sm font-medium mb-2">
        Number of Questions
      </label>
      <div className="flex items-center gap-4">
        <button
          onClick={handleDecrement}
          className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
          aria-label="Decrease question count"
        >
          -
        </button>
        <input
          type="number"
          id="questionCount"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            if (newValue >= 5 && newValue <= 20) {
              onChange(newValue);
            }
          }}
          min={5}
          max={20}
          className="w-20 text-center px-2 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleIncrement}
          className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
          aria-label="Increase question count"
        >
          +
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Min: 5, Max: 20 questions</p>
    </div>
  );
}
