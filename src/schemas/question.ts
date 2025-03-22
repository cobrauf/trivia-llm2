import { z } from "zod";

export const QuestionGenerationSchema = z.object({
  topic: z.string().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().int().min(1).max(10),
});

export type QuestionGenerationParams = z.infer<typeof QuestionGenerationSchema>;

export const QuestionSchema = z.object({
  question: z.string(),
  correctAnswer: z.string(),
  incorrectAnswers: z.array(z.string()).length(3),
  explanation: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;
