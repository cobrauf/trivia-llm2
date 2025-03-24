# Back Navigation Implementation Plan

## Overview

Add a confirmation modal when users try to navigate back to the welcome page, either through the browser's back button or a new "Back to Welcome" button.

## Components to Create

### 1. ConfirmationModal Component

- Create a new modal component for general confirmations
- Should accept:
  - isOpen: boolean
  - onConfirm: () => void
  - onCancel: () => void
  - message: string
- Style consistently with existing modals
- Use the same purple gradient background

### 2. Back Navigation Handler

- Add beforeunload event listener to catch browser back button
- Implement custom back button handling
- Show confirmation modal when either back method is triggered
- Only apply on question page (not summary)

### 3. "Back to Welcome" Button

- Position in top-left corner outside main container
- Style in blue to match other navigation elements
- Trigger same confirmation modal as back button
- Text: "Back to Welcome"

## Implementation Steps

1. Create ConfirmationModal Component:

   - Build reusable confirmation dialog
   - Use existing modal styling from LoadingModal
   - Add clear Call-to-Action buttons

2. Update QuestionPage:

   - Add state for modal visibility
   - Add handler for browser back button
   - Implement modal confirmation logic
   - Add route navigation on confirm

3. Add Back to Welcome Button:

   - Position outside main content area
   - Style consistently with other navigation
   - Connect to same confirmation flow

4. Testing Scenarios:
   - Browser back button navigation
   - Manual back button click
   - Modal cancel/confirm actions
   - Proper navigation after confirmation

## Technical Details

### File Changes

- Create: `src/components/ConfirmationModal.tsx`
- Modify: `src/app/quiz/question/page.tsx`

### Key Considerations

- Maintain styling consistency with existing UI
- Handle both navigation methods uniformly
- Ensure proper cleanup of event listeners
- Maintain state persistence during navigation
