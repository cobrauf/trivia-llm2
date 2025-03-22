# Question Generation System Implementation Plan

## 1. Schema Definition

Create Zod schemas for question generation parameters:

```typescript
// src/schemas/question.ts
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
```

## 2. OpenRouter API Integration

Create API client with type-safe request/response handling:

```typescript
// src/lib/openrouter.ts
import { z } from "zod";

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

export async function generateQuestions(
  params: QuestionGenerationParams
): Promise<Question[]> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable trivia expert who creates engaging, factually accurate questions.",
          },
          {
            role: "user",
            content: generatePrompt(params),
          },
        ],
      }),
    }
  );

  // Validate response
  const result = OpenRouterResponseSchema.parse(await response.json());
  const questions = parseQuestionsFromResponse(
    result.choices[0].message.content
  );
  return QuestionSchema.array().parse(questions);
}
```

## 3. Prompt Engineering

Create function to generate effective prompts:

```typescript
// src/lib/prompts.ts
function generatePrompt(params: QuestionGenerationParams): string {
  return `Generate ${params.questionCount} multiple choice trivia questions about ${params.topic} at ${params.difficulty} difficulty level.

For each question:
- Ensure factual accuracy
- Provide one correct answer
- Provide exactly three incorrect but plausible answers
- Make ${params.difficulty} level appropriate
- Format as JSON array matching this structure:
[{
  "question": "question text",
  "correctAnswer": "correct answer",
  "incorrectAnswers": ["wrong1", "wrong2", "wrong3"],
  "explanation": "brief explanation of why the correct answer is right"
}]`;
}
```

## 4. API Route Implementation

Create Next.js API route for question generation:

```typescript
// src/app/api/questions/route.ts
import { NextResponse } from "next/server";
import { QuestionGenerationSchema } from "@/schemas/question";
import { generateQuestions } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = QuestionGenerationSchema.parse(body);
    const questions = await generateQuestions(params);
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 }
    );
  }
}
```

## Next Steps for Implementation

1. Create required directories and files:

   - src/schemas/question.ts
   - src/lib/openrouter.ts
   - src/lib/prompts.ts
   - src/app/api/questions/route.ts

2. Add OpenRouter API key to environment:

   - Create .env.local file
   - Add OPENROUTER_API_KEY variable

3. Test API endpoint:

   - Test with valid parameters
   - Verify error handling
   - Check response format and validation

4. Future Improvements:
   - Add rate limiting
   - Implement caching
   - Add response streaming
   - Improve error handling
