import { z } from "zod";
import { QUIZ_CONSTANTS } from "@/lib/quiz";

export const QuestionGenerationSchema = z.object({
  topic: z.string().min(1).max(100),
  difficulty: z.enum([
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ROOKIE,
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.PRO,
    QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ELITE,
  ]),
  questionCount: z
    .number()
    .int()
    .min(QUIZ_CONSTANTS.MIN_QUESTIONS)
    .max(QUIZ_CONSTANTS.MAX_QUESTIONS),
  stream: z.boolean().optional(),
});

export type QuestionGenerationParams = z.infer<typeof QuestionGenerationSchema>;

// Helper function to count words
function countWords(str: string): number {
  return str.trim().split(/\s+/).length;
}

// Custom validators for word count
const maxWords = (limit: number) => (value: string) => {
  const wordCount = countWords(value);
  return (
    wordCount <= limit ||
    `Text exceeds ${limit} words (found ${wordCount} words)`
  );
};

export const QuestionSchema = z.object({
  question: z
    .string()
    .refine(maxWords(50), "Question must not exceed 50 words"),
  correctAnswer: z
    .string()
    .refine(maxWords(10), "Answer must not exceed 10 words"),
  incorrectAnswers: z
    .array(z.string().refine(maxWords(10), "Answer must not exceed 10 words"))
    .length(3),
  explanation: z
    .string()
    .refine(maxWords(50), "Explanation must not exceed 50 words"),
});

export type Question = z.infer<typeof QuestionSchema>;
