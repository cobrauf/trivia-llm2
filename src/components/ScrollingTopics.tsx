"use client";

import { useMemo } from "react";
import { TOPIC_CATEGORIES } from "@/data/suggestedTopics";
import { TopicButton } from "./TopicButton";

interface ScrollingTopicsProps {
  onTopicSelect: (topic: string) => void;
}

// Fisher-Yates shuffle function to randomize an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]; // Create a copy of the array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
};

export function ScrollingTopics({ onTopicSelect }: ScrollingTopicsProps) {
  // Get topics from each category and shuffle them
  const categoryTopics = useMemo(() => {
    // Use the first category for row 1 and shuffle
    const row1 = shuffleArray(TOPIC_CATEGORIES[0].topics);

    // Use the second category for row 2 and shuffle
    const row2 = shuffleArray(TOPIC_CATEGORIES[1].topics);

    return [row1, row2] as [string[], string[]];
  }, []);

  const getScrollDuration = (topics: string[]) => {
    // Calculate approximate width (each topic ~150px + gap)
    // Increase the estimated width per topic to ensure full visibility
    const averageTopicWidth = 150; // px (including gap)
    const totalWidth = topics.length * averageTopicWidth;

    // Slower speed for better readability (smaller denominator = slower speed)
    const speedFactor = 20; // Reduced from 100 for slower scrolling

    return totalWidth / speedFactor;
  };

  const row1Duration = getScrollDuration(categoryTopics[0]);
  const row2Duration = getScrollDuration(categoryTopics[1]);

  return (
    <div className="w-full mb-2">
      <div className="space-y-0">
        {/* First row - scrolling right */}
        <div className="overflow-hidden py-1">
          <div className="relative">
            {/* Duplicate the topics to create a seamless loop */}
            <div
              className="flex items-center whitespace-nowrap gap-2 px-2"
              style={{
                animation: `scroll-right ${row1Duration}s linear infinite`,
                willChange: "transform",
                width: "fit-content", // Ensure container fits all content
              }}
            >
              {/* Show the topics once */}
              {categoryTopics[0].map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}`}
                  topic={topic}
                  onSelect={onTopicSelect}
                />
              ))}
              {/* Duplicate for seamless loop */}
              {categoryTopics[0].map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}-dup`}
                  topic={topic}
                  onSelect={onTopicSelect}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Second row - scrolling left */}
        <div className="overflow-hidden py-1">
          <div className="relative">
            <div
              className="flex items-center whitespace-nowrap gap-2 px-2"
              style={{
                animation: `scroll-left ${row2Duration}s linear infinite`,
                willChange: "transform",
                width: "fit-content", // Ensure container fits all content
              }}
            >
              {/* Show the topics once */}
              {categoryTopics[1].map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}`}
                  topic={topic}
                  onSelect={onTopicSelect}
                />
              ))}
              {/* Duplicate for seamless loop */}
              {categoryTopics[1].map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}-dup`}
                  topic={topic}
                  onSelect={onTopicSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
