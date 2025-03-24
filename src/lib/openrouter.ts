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

// Parse a partial JSON string that might be incomplete
function parsePartialQuestionsFromResponse(content: string): Question[] {
  try {
    // Try to find a complete JSON question object
    const regex = /(\{(?:[^{}]|(?:\{[^{}]*\}))*\})/g;
    const matches = content.match(regex);

    if (!matches) return [];

    const validQuestions: Question[] = [];

    for (const potentialJson of matches) {
      try {
        // Try to parse each potential JSON object
        const parsed = JSON.parse(potentialJson);

        // Validate if it has the required structure
        if (
          parsed.question &&
          parsed.correctAnswer &&
          Array.isArray(parsed.incorrectAnswers) &&
          parsed.explanation
        ) {
          try {
            // Try to validate with our schema
            const validQuestion = QuestionSchema.parse(parsed);
            validQuestions.push(validQuestion);
          } catch (e) {
            // Skip invalid questions
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    return validQuestions;
  } catch (error) {
    console.error("Error parsing partial questions:", error);
    return [];
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

export async function* generateQuestionsStream(
  params: QuestionGenerationParams & { initialQuestion?: any }
): AsyncGenerator<{ questions?: Question[]; done?: boolean; total: number }> {
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
        stream: true,
        // Add cache control to avoid returning cached results
        cache: params.initialQuestion ? "none" : undefined,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let processedQuestions = new Set<string>();
  let lastYieldedCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // On stream completion, try to parse any remaining content and mark as done
        const finalQuestions = parsePartialQuestionsFromResponse(buffer);
        const newQuestions = finalQuestions.filter(
          (q) => !processedQuestions.has(q.question)
        );

        if (newQuestions.length > 0) {
          for (const q of newQuestions) {
            processedQuestions.add(q.question);
          }
          yield {
            questions: newQuestions,
            done: true,
            total: params.questionCount,
          };
        } else {
          yield { done: true, total: params.questionCount };
        }
        break;
      }

      // Append new chunk to buffer
      buffer += decoder.decode(value, { stream: true });

      // Try to extract complete questions
      const questions = parsePartialQuestionsFromResponse(buffer);

      // Filter out questions we've already processed
      const newQuestions = questions.filter(
        (q) => !processedQuestions.has(q.question)
      );

      if (newQuestions.length > 0) {
        // Mark these questions as processed
        for (const q of newQuestions) {
          processedQuestions.add(q.question);
        }

        // Only yield if we have new questions
        yield {
          questions: newQuestions,
          total: params.questionCount,
        };

        lastYieldedCount = processedQuestions.size;
      } else if (processedQuestions.size > lastYieldedCount) {
        // If we have more processed questions but no new complete ones,
        // send an update on the count
        yield { total: params.questionCount };
        lastYieldedCount = processedQuestions.size;
      }
    }
  } catch (error) {
    console.error("Error in streaming questions:", error);
    reader.cancel();
    throw error;
  }
}
