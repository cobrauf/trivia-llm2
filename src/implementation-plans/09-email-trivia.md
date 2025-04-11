# Email Trivia Feature Implementation Plan

## Overview

Add functionality to email trivia questions, answers, and results from the summary page.

## Technical Details

### Environment Configuration

1. Add new environment variable for n8n webhook URL

```
N8N_WEBHOOK_URL=https://cloud.n8n.io/webhook/abc123-xyz789
```

### UI Components

1. Add "Email Trivia" button next to "Start New Round" button

   - Use same styling as existing button for consistency
   - Add flex container to wrap both buttons side by side
   - Adjust responsive layout for mobile screens

2. Create new EmailModal component in `src/components/EmailModal.tsx`
   - Based on existing ConfirmationModal component
   - Add email input field with validation
   - Include "Send" and "Cancel" buttons
   - Show loading state while sending

### Data Structure

The email payload will include:

- All questions with their answers
- User's selected answers
- Score summary

```typescript
interface EmailPayload {
  questions: QuestionWithShuffledAnswers[];
  userAnswers: AnsweredQuestion[];
  summary: {
    score: number;
    totalQuestions: number;
    percentage: number;
  };
  recipientEmail: string;
}
```

### Implementation Steps

1. Environment Setup:

   - Add N8N_WEBHOOK_URL to .env.local
   - Create emailService.ts for handling API calls

2. Component Changes:
   - Modify QuizSummaryPage to include new button and modal state
   - Create EmailModal component with email input validation
   - Add loading state for send operation
3. API Integration:

   - Create function to format quiz data for email
   - Integrate with n8n webhook for sending
   - Handle success/error states appropriately
   - Implement retry logic for failed requests

4. Error Handling:

   - Email validation (regex pattern)
   - API error handling with user-friendly messages
   - User feedback for success/failure
   - Network timeout handling

5. Styling:
   - Consistent with existing modal styles
   - Responsive design for button layout
   - Loading state indicators
   - Success/error state styling

### Risk Areas

- Email validation robustness
- API error handling
- Mobile responsiveness of dual buttons
- Network timeout handling
- Rate limiting considerations

### Testing Scenarios

1. Email validation
   - Valid email formats
   - Invalid email formats
   - Empty input handling
2. Modal behavior
   - Open/close
   - Backdrop click handling
   - Keyboard accessibility (Esc to close)
3. Send functionality
   - Success path
   - Network error handling
   - Timeout handling
4. Data formatting
   - Correct payload structure
   - Special character handling
5. Mobile testing
   - Button layout
   - Modal responsiveness
   - Touch interaction

### Success Criteria

1. Users can enter their email address
2. Email contains all quiz questions, correct answers, and user's answers
3. Score summary is included
4. Users receive appropriate feedback for all actions
5. Interface is responsive and accessible
6. Error states are handled gracefully
