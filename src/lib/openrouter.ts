import { z } from "zod";
import {
  QuestionGenerationParams,
  Question,
  QuestionSchema,
} from "@/schemas/question";
import { QUIZ_CONSTANTS, DifficultyLevel } from "@/lib/quiz";

// Toggle for using local LLM instead of OpenRouter
// Read from environment variable or default to false
const USE_LOCAL_LLM = process.env.USE_LOCAL_LLM === "true";

// OpenRouter model config
const LLM_MODEL = "google/gemini-2.0-flash-thinking-exp:free";

// Local LLM config (from environment variables)
const LOCAL_LLM_URL =
  process.env.LOCAL_LLM_URL || "http://localhost:1234/v1/chat/completions";
const LOCAL_LLM_MODEL =
  process.env.LOCAL_LLM_MODEL || "wizard-vicuna-13b-uncensored";
const LOCAL_LLM_API_KEY = process.env.LOCAL_LLM_API_KEY || "";

// Log LLM configuration on startup
if (typeof window === "undefined") {
  // Only on server-side
  console.log("------------------------------------");
  console.log(
    `LLM Configuration: ${USE_LOCAL_LLM ? "LOCAL LLM" : "OPENROUTER"}`
  );
  if (USE_LOCAL_LLM) {
    console.log(`- URL: ${LOCAL_LLM_URL}`);
    console.log(`- Model: ${LOCAL_LLM_MODEL}`);
    console.log(
      `- API Key: ${
        LOCAL_LLM_API_KEY ? "***PROVIDED***" : "***NOT PROVIDED***"
      }`
    );
  } else {
    console.log(`- Model: ${LLM_MODEL}`);
    console.log(
      `- API Key: ${
        process.env.OPENROUTER_API_KEY ? "***PROVIDED***" : "***NOT PROVIDED***"
      }`
    );
  }
  console.log("------------------------------------");
}

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

// Function to determine which API endpoint to use
function getLLMApiUrl(): string {
  return USE_LOCAL_LLM
    ? LOCAL_LLM_URL
    : "https://openrouter.ai/api/v1/chat/completions";
}

// Function to get appropriate headers based on selected API
function getLLMHeaders(): HeadersInit {
  if (USE_LOCAL_LLM) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add API key if provided
    if (LOCAL_LLM_API_KEY) {
      headers.Authorization = `Bearer ${LOCAL_LLM_API_KEY}`;
    }

    return headers;
  } else {
    // OpenRouter headers
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
      "X-Title": "Trivia Question Generator",
    };
  }
}

// Function to create the appropriate request body for the selected API
function createLLMRequestBody(
  params: QuestionGenerationParams,
  stream: boolean = false
) {
  const messages = [
    {
      role: "system",
      content:
        "You are a knowledgeable trivia expert who creates engaging, factually accurate questions.",
    },
    {
      role: "user",
      content: generatePrompt(params),
    },
  ];

  if (USE_LOCAL_LLM) {
    return {
      model: LOCAL_LLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 10000,
      stream,
    };
  } else {
    return {
      model: LLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 10000,
      stream,
    };
  }
}

function generatePrompt(params: QuestionGenerationParams): string {
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

// Update the generateQuestions function to use the helper functions
export async function generateQuestions(
  params: QuestionGenerationParams
): Promise<Question[]> {
  if (!USE_LOCAL_LLM && !process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const apiUrl = getLLMApiUrl();
  const headers = getLLMHeaders();
  const body = createLLMRequestBody(params);

  console.log(
    `Using ${USE_LOCAL_LLM ? "local LLM" : "OpenRouter"} API at ${apiUrl}`
  );

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const result = OpenRouterResponseSchema.parse(await response.json());
  const questions = parseQuestionsFromResponse(
    result.choices[0].message.content
  );
  return questions;
}

// Update the streaming function to use the helper functions
export async function* generateQuestionsStream(
  params: QuestionGenerationParams
): AsyncGenerator<{ questions?: Question[]; done?: boolean; total: number }> {
  if (!USE_LOCAL_LLM && !process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const apiUrl = getLLMApiUrl();
  const headers = getLLMHeaders();
  const body = createLLMRequestBody(params, true);

  console.log(
    `Using ${
      USE_LOCAL_LLM ? "local LLM" : "OpenRouter"
    } streaming API at ${apiUrl}`
  );

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let processedQuestions = new Set<string>();
  let lastYieldedCount = 0;
  let fullContent = ""; // Collecting the full content for parsing

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // On stream completion, try to parse any remaining content and mark as done
        const finalQuestions = parsePartialQuestionsFromResponse(fullContent);
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

      // Process the chunk properly
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process SSE format (both OpenRouter and many local LLMs use this format)
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // Remove 'data: ' prefix

          if (data === "[DONE]") {
            // Stream is complete
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            // Handle both OpenRouter and standard LLM API formats
            const contentDelta =
              parsed.choices &&
              // OpenRouter format
              (parsed.choices[0]?.delta?.content ||
                // Standard format (e.g., local LLMs)
                parsed.choices[0]?.message?.content);

            if (contentDelta) {
              // Accumulate content for parsing questions
              fullContent += contentDelta;

              // Try to parse questions from what we have so far
              const questions = parsePartialQuestionsFromResponse(fullContent);

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

                // Debug log
                console.log(
                  `Found ${newQuestions.length} new questions, total: ${processedQuestions.size}`
                );
              }
            }
          } catch (error) {
            // Skip lines that aren't valid JSON
            console.log("Error parsing SSE data:", error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in streaming questions:", error);
    reader.cancel();
    throw error;
  }
}
