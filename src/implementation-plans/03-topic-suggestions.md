# Topic Suggestions Scrolling Implementation Plan

## Overview

Add two rows of horizontally scrolling topic suggestion buttons above the topic input field. The rows will scroll in opposite directions and have gradient fading effects on the sides.

## Components and Data Structure

### 1. Topics Data File (`src/data/suggestedTopics.ts`)

```typescript
interface TopicCategory {
  name: string;
  topics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    name: "General Knowledge",
    topics: [
      "History",
      "Geography",
      "Science",
      "Art",
      "Literature",
      "Music",
      "Movies",
      "Sports",
      "Food",
      "Technology",
      // Easy to add more...
    ],
  },
  {
    name: "Specific Interests",
    topics: [
      "Ancient Egypt",
      "Space Exploration",
      "Wildlife",
      "Olympic Games",
      "Famous Inventions",
      "World Cuisine",
      "Classic Rock",
      "Superheroes",
      "Video Games",
      "Famous Artists",
      // Easy to add more...
    ],
  },
];

export function getRandomizedTopics(): [string[], string[]] {
  return TOPIC_CATEGORIES.map((category) =>
    [...category.topics].sort(() => Math.random() - 0.5)
  ) as [string[], string[]];
}
```

### 2. Create New Component: `ScrollingTopics`

- Create a new component that will contain both scrolling rows
- Props:
  - `onTopicSelect: (topic: string) => void` - Callback when a topic is selected

### 3. Topic Button Component

- Create styled buttons that:
  - Have a semi-transparent background
  - Show hover effect
  - Are padded appropriately
  - Have consistent width based on content

## Implementation Details

### 1. Styling and Animation

- Use a container with `overflow-hidden` to clip the scrolling content
- Use CSS gradients for fading effects:
  ```css
  .fade-edges {
    mask-image: linear-gradient(
      to right,
      transparent,
      black 10%,
      black 90%,
      transparent
    );
  }
  ```
- Implement infinite scrolling animation:

  ```css
  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes scroll-right {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0);
    }
  }
  ```

### 2. Integration with Topics Data

1. Use `getRandomizedTopics()` in the ScrollingTopics component:

```typescript
const ScrollingTopics: React.FC<{ onTopicSelect: (topic: string) => void }> = ({
  onTopicSelect,
}) => {
  const [row1Topics, row2Topics] = useMemo(() => getRandomizedTopics(), []);

  // Duplicate topics for seamless scrolling
  const row1Content = [...row1Topics, ...row1Topics];
  const row2Content = [...row2Topics, ...row2Topics];

  // Rest of the component implementation...
};
```

### 3. Integration

1. Add the ScrollingTopics component to the top of the trivia configuration box
2. Position it between the title and the topic input
3. Ensure proper spacing and alignment with existing elements

### 4. Interaction

- When a topic button is clicked:
  1. Fill the topic input field with the selected topic
  2. Add a brief highlight effect to show the selection
  3. Keep the button row scrolling smoothly

### 5. Animations

- First row scrolls left-to-right
- Second row scrolls right-to-left
- Both animations should be:
  - Smooth and continuous
  - Different speeds for visual interest
  - No noticeable reset point (seamless looping)

### 6. Performance Considerations

- Use CSS transform for smooth animations
- Implement scroll duplication for seamless looping
- Use hardware acceleration where possible
- Consider pausing animations when tab is not visible

## Technical Implementation

1. Create new files:

   - `src/data/suggestedTopics.ts` - For topic data and randomization
   - `src/components/ScrollingTopics.tsx` - Main component
   - `src/components/TopicButton.tsx` - Button component

2. Update existing files:

   - Modify `src/app/(trivia)/page.tsx` to include the new component
   - Possibly update `globals.css` for new animations

3. Add new CSS classes for:
   - Fading edges effect
   - Scrolling animations
   - Button styling
   - Container layout

## Accessibility

- Ensure buttons are keyboard navigable
- Add appropriate ARIA labels
- Provide option to pause animations
- Maintain color contrast for readability
