# LLM Model Fallback Implementation Plan

## Overview

Implement a fallback system for OpenRouter LLM models to use a free model first and fall back to a metered model when necessary.

## Requirements

1. Support two LLM models configurable via environment variables:
   - LLM_MODEL_1: "google/gemini-2.0-flash-thinking-exp:free" (free model)
   - LLM_MODEL_2: "google/gemini-2.0-flash-001" (metered model)
2. Try using LLM_MODEL_1 first
3. If LLM_MODEL_1 fails, fall back to LLM_MODEL_2
4. Make models configurable via .env.local file

## Implementation Steps

1. Update Environment Variables

   - Add new environment variables to .env.local:
     ```
     LLM_MODEL_1="google/gemini-2.0-flash-thinking-exp:free"
     LLM_MODEL_2="google/gemini-2.0-flash-001"
     ```

2. Modify src/lib/openrouter.ts:

   - Remove hardcoded LLM_MODEL constant
   - Add environment variable checks for both models
   - Create a retryWithFallback utility function
   - Update generateQuestions and generateQuestionsStream functions to use the fallback system

3. Implementation Details:

   - Load model configurations from environment variables
   - Create helper function to attempt LLM request with fallback:
     1. Try request with LLM_MODEL_1
     2. If it fails, retry with LLM_MODEL_2
     3. If both fail, throw error with details
   - Update logging to show which model is being used
   - Preserve all existing functionality (streaming, parsing, etc.)

4. Error Handling:
   - Add specific error types for model-related failures
   - Log model switch events for monitoring
   - Ensure appropriate error messages are shown to users

## Testing Plan

1. Test successful requests with free model
2. Test fallback scenarios:
   - Free model quota exceeded
   - Free model error response
   - Both models failing
3. Test with streaming and non-streaming requests
4. Verify environment variable configuration works as expected

## Migration

No migration needed as this is a non-breaking enhancement to existing functionality.
