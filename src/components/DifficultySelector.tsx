import { QUIZ_CONSTANTS, DifficultyLevel } from "@/lib/quiz";

interface DifficultySelectorProps {
  value: DifficultyLevel;
  onChange: (value: DifficultyLevel) => void;
}

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  const difficulties: DifficultyLevel[] = [
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ROOKIE,
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.NORMAL,
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ELITE,
  ];

  // Map each difficulty to its own tagline
  const difficultyTaglines: Record<DifficultyLevel, string> = {
    [QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ROOKIE]:
      "I'm basically a potato playing this game.",
    [QUIZ_CONSTANTS.DIFFICULTY_LEVELS.NORMAL]:
      "I know enough to fake it till I make it.",
    [QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ELITE]:
      "I've been preparing for this since birth. It's time.",
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 text-purple-200">
        Difficulty
      </label>
      <div className="flex gap-2">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => onChange(difficulty)}
            className={`
              flex-1 px-3 py-2 rounded-lg border text-sm capitalize transition-colors
              ${
                value === difficulty
                  ? "bg-purple-600 border-purple-400 text-white"
                  : "border-purple-500/20 bg-purple-900/50 text-purple-200 hover:bg-purple-700/50 hover:text-white"
              }
            `}
          >
            {difficulty}
          </button>
        ))}
      </div>
      {/* Display the tagline for the selected difficulty */}
      <p className="mt-1 text-xs text-purple-300/70">
        {difficultyTaglines[value]}
      </p>
    </div>
  );
}
