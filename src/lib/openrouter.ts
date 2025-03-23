import { z } from "zod";
import {
  QuestionGenerationParams,
  Question,
  QuestionSchema,
} from "@/schemas/question";
import { QUIZ_CONSTANTS, DifficultyLevel } from "@/lib/quiz";

// const LLM_MODEL = "google/gemini-2.0-flash-exp:free";
const LLM_MODEL = "google/gemini-2.0-flash-thinking-exp:free";

const OpenRouterResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
        role: z.string(),
      }),
    })
  ),
});

function generatePrompt(
  params: QuestionGenerationParams,
  initialQuestion?: any
): string {
  const difficultyMap: Record<DifficultyLevel, string> = {
    [QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ROOKIE]: "beginner",
    [QUIZ_CONSTANTS.DIFFICULTY_LEVELS.PRO]: "intermediate",
    [QUIZ_CONSTANTS.DIFFICULTY_LEVELS.ELITE]: "advanced",
  };

  let prompt = `Generate ${
    params.questionCount
  } multiple choice trivia questions about ${params.topic} at ${
    difficultyMap[params.difficulty]
  } level.`;

  // If initialQuestion is provided, add instructions to avoid duplicating it
  if (initialQuestion) {
    prompt += `\n\nAvoid generating a question similar to the following:
Question: "${initialQuestion.question}"
Answer: "${initialQuestion.correctAnswer}"

Generate completely different questions both in topic and wording.`;
  }

  prompt += `\n\nFor each question:
- Question text must be no more than 50 words
- Each answer (correct and incorrect) must be no more than 10 words
- Explanation must be no more than 50 words
- Ensure factual accuracy
- Provide one correct answer
- Provide exactly three incorrect but plausible answers
- Make ${difficultyMap[params.difficulty]} level appropriate
- Include a brief explanation of why the correct answer is right
- Format as JSON array matching this structure:
[{
  "question": "question text",
  "correctAnswer": "correct answer",
  "incorrectAnswers": ["wrong1", "wrong2", "wrong3"],
  "explanation": "brief explanation of why the correct answer is right"
}]`;

  return prompt;
}

function parseQuestionsFromResponse(content: string): Question[] {
  try {
    // Find the JSON array in the response content
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const parsedQuestions = JSON.parse(jsonMatch[0]);
    return QuestionSchema.array().parse(parsedQuestions);
  } catch (error) {
    console.error("Error parsing questions from response:", error);
    throw new Error("Failed to parse questions from AI response");
  }
}

export async function generateQuestions(
  params: QuestionGenerationParams & { initialQuestion?: any }
): Promise<Question[]> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
        "X-Title": "Trivia Question Generator",
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable trivia expert who creates engaging, factually accurate questions.",
          },
          {
            role: "user",
            content: generatePrompt(params, params.initialQuestion),
          },
        ],
        temperature: 0.7,
        max_tokens: 10000,
        // Add cache control to avoid returning cached results
        cache: params.initialQuestion ? "none" : undefined,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const result = OpenRouterResponseSchema.parse(await response.json());
  const questions = parseQuestionsFromResponse(
    result.choices[0].message.content
  );
  return questions;
}
