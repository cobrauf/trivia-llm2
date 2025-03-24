# Loading Modal Implementation Plan

## Overview

Move the question loading state from a dedicated page to a modal overlay on the trivia configuration page.

## Steps

1. Create Loading Modal Component

- Create `src/components/LoadingModal.tsx`
- Move existing loading UI from loading page
- Add modal styling and backdrop
- Show progress indicator ("Fetching remaining questions... x/total")

2. Update Trivia Configuration Page

- Add state for loading modal visibility
- Add state for question generation progress
- Move question generation logic from loading page
- Handle navigation to question page once first question is ready
- Add LoadingModal component to the page

3. Update Routing

- Remove loading page and its route
- Update navigation to skip loading page entirely
- Keep loading state in trivia page while questions generate

4. Clean Up

- Delete `src/app/quiz/loading/page.tsx`
- Update any routes that were pointing to loading page
- Ensure session storage handling remains consistent

## Component Structure

```tsx
<div className="min-h-screen">
  {/* Existing trivia config UI */}
  {isLoading && (
    <LoadingModal currentCount={progress.current} totalCount={progress.total} />
  )}
</div>
```

## Technical Considerations

1. Modal should prevent interaction with the underlying form
2. Keep existing streaming functionality intact
3. Progress counter should update in real-time as questions are generated
4. Maintain accessibility with proper focus management
