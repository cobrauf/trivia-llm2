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
      <div className="flex gap-4">
        <button
          onClick={handleDecrement}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-500 active:bg-yellow-500 active:text-white text-xl font-bold transition-colors"
          aria-label="Decrease question count"
        >
          -
        </button>
        <input
          type="number"
          id="questionCount"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10);
            if (!isNaN(newValue) && newValue >= 5 && newValue <= 20) {
              onChange(newValue);
            }
          }}
          min={5}
          max={20}
          className="flex-1 text-center px-2 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleIncrement}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-500 active:bg-yellow-500 active:text-white text-xl font-bold transition-colors"
          aria-label="Increase question count"
        >
          +
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">Min: 5, Max: 20 questions</p>
    </div>
  );
}
