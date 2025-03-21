type Difficulty = "easy" | "medium" | "hard";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">Difficulty</label>
      <div className="flex gap-4">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => onChange(difficulty)}
            className={`
              flex-1 px-4 py-2 rounded-lg border capitalize transition-colors
              ${
                value === difficulty
                  ? "bg-yellow-500 text-white border-transparent"
                  : "border-gray-300 hover:bg-gray-500"
              }
            `}
          >
            {difficulty}
          </button>
        ))}
      </div>
    </div>
  );
}
