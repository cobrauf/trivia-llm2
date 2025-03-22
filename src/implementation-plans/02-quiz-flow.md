# Quiz Flow Implementation Plan

## Overview

Create a multi-stage flow for the quiz:

1. Configuration → Loading → Question Interface
2. Handle question generation in phases (initial + remaining)
3. Implement interactive question UI with multiple choice

## Component Structure

### LoadingView Component

```
┌────────────────────────────────┐
│      Preparing Your Quiz...    │
│         [Loading Spinner]      │
│                               │
│    Topic: {selected topic}     │
│    Difficulty: {level}         │
└────────────────────────────────┘
```

### QuestionView Component

```
┌────────────────────────────────┐
│ Question 1/5     [Back] [Next] │
├────────────────────────────────┤
│ {Question text}                │
│                               │
│ [ ] Answer 1                  │
│ [ ] Answer 2                  │
│ [ ] Answer 3                  │
│ [ ] Answer 4                  │
│                               │
│        [Confirm Answer]       │
├────────────────────────────────┤
│ Explanation:                   │
│ (Shows after confirming)      │
└────────────────────────────────┘
```

## State Management

```typescript
interface QuizState {
  currentQuestionIndex: number;
  questions: Question[];
  selectedAnswer: string | null;
  answeredQuestions: {
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
    showExplanation: boolean;
  }[];
  loadingRemaining: boolean;
}
```

## Navigation Behavior

- Allow moving between questions after answering
- Questions can be reviewed but not re-answered
- Show explanation immediately after confirming answer
- Navigation controls:
  - Back button (disabled on first question)
  - Next button (disabled on last question)
  - Question number indicator

## Flow Details

1. **Configuration Stage**

   - Select topic, count, difficulty
   - Submit triggers loading stage

2. **Loading Stage**

   - Show loading animation
   - Display selected configuration
   - Generate initial question
   - Auto-advance when ready

3. **Question Stage**
   - Display current question
   - Show multiple choice options
   - Handle answer confirmation
   - Show explanation
   - Allow navigation between answered questions

## Implementation Steps

1. Create Loading Page

   ```typescript
   // pages/quiz/loading.tsx
   - Initialize question generation
   - Show loading animation
   - Display quiz settings
   - Redirect when first question ready
   ```

2. Create Question Page

   ```typescript
   // pages/quiz/question.tsx
   - Display current question
   - Handle answer selection
   - Show explanation after confirmation
   - Enable navigation for answered questions
   ```

3. Add Navigation

   ```typescript
   // components/quiz/Navigation.tsx
   - Back/Next buttons
   - Question progress
   - Disabled states based on progress
   ```

4. State Management
   ```typescript
   // hooks/useQuizState.ts
   - Track answered questions
   - Manage navigation state
   - Handle remaining questions loading
   ```

## Component Details

1. **LoadingSpinner**

   - Animated circular progress
   - Status message below

2. **AnswerButton**

   ```typescript
   interface AnswerButtonProps {
     text: string;
     selected: boolean;
     disabled: boolean;
     isCorrect?: boolean; // Only shown after answering
     onClick: () => void;
   }
   ```

3. **QuizNavigation**

   ```typescript
   interface QuizNavigationProps {
     currentQuestion: number;
     totalQuestions: number;
     canGoBack: boolean;
     canGoForward: boolean;
     onNavigate: (direction: "back" | "forward") => void;
   }
   ```

4. **ExplanationPanel**
   ```typescript
   interface ExplanationPanelProps {
     explanation: string;
     isCorrect: boolean;
     selectedAnswer: string;
     correctAnswer: string;
   }
   ```

## Styling Requirements

1. Answer Buttons

   - Default: Neutral background
   - Selected: Highlighted border
   - After confirming:
     - Correct: Green background
     - Incorrect: Red background
     - Correct answer (if wrong): Green border

2. Navigation

   - Disabled state for unavailable directions
   - Current question number emphasized
   - Loading indicator for remaining questions

3. Explanation Panel
   - Slides up after confirming answer
   - Different styling for correct/incorrect
   - Clear typography for readability

## Error Handling

1. Loading Errors

   - Retry option for failed generation
   - Error message display
   - Return to configuration option

2. Navigation Errors

   - Prevent invalid navigation
   - Handle missing questions gracefully

3. State Persistence
   - Save progress in sessionStorage
   - Handle page refresh recovery

Would you like me to proceed with implementing this plan, or would you like to make any adjustments first?
