export const QUIZ_CONSTANTS = {
  MIN_QUESTIONS: 3,
  MAX_QUESTIONS: 10,
  DIFFICULTY_LEVELS: {
    ROOKIE: "rookie",
    PRO: "pro",
    ELITE: "elite",
  },
} as const;

export type DifficultyLevel =
  (typeof QUIZ_CONSTANTS.DIFFICULTY_LEVELS)[keyof typeof QUIZ_CONSTANTS.DIFFICULTY_LEVELS];
