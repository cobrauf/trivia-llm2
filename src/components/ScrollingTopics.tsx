"use client";

import { useMemo } from "react";
import { TOPIC_CATEGORIES } from "@/data/suggestedTopics";
import { TopicButton } from "./TopicButton";

interface ScrollingTopicsProps {
  onTopicSelect: (topic: string) => void;
}

export function ScrollingTopics({ onTopicSelect }: ScrollingTopicsProps) {
  // Get topics from each category separately
  const categoryTopics = useMemo(() => {
    // Use the first category for row 1
    const row1 = TOPIC_CATEGORIES[0].topics;

    // Use the second category for row 2
    const row2 = TOPIC_CATEGORIES[1].topics;

    return [row1, row2] as [string[], string[]];
  }, []);

  const getScrollDuration = (topics: string[]) => {
    // Calculate approximate width (each topic ~150px + gap)
    const distance = topics.length * 120; // reduced from 170 to make buttons scroll faster
    return distance / 100; // Speed factor - increased denominator from 100 to 200 to make faster
  };

  const row1Duration = getScrollDuration(categoryTopics[0]);
  const row2Duration = getScrollDuration(categoryTopics[1]);

  return (
    <div className="w-full mb-4">
      <div className="space-y-2">
        {" "}
        {/* Reduced from space-y-3 to bring rows closer */}
        {/* First row - scrolling right */}
        <div className="overflow-hidden py-1">
          <div className="relative">
            {/* Duplicate the topics to create a seamless loop */}
            <div
              className="flex items-center whitespace-nowrap gap-2 px-2" /* Reduced gap from 3 to 2 and padding from 3 to 2 */
              style={{
                animation: `scroll-right ${row1Duration}s linear infinite`,
                willChange: "transform",
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
              {/* Duplicate the topics to create a seamless loop */}
              {categoryTopics[0].map((topic, index) => (
                <TopicButton
                  key={`${topic}-dup-${index}`}
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
              className="flex items-center whitespace-nowrap gap-2 px-2" /* Reduced gap from 3 to 2 and padding from 3 to 2 */
              style={{
                animation: `scroll-left ${row2Duration}s linear infinite`,
                willChange: "transform",
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
              {/* Duplicate the topics to create a seamless loop */}
              {categoryTopics[1].map((topic, index) => (
                <TopicButton
                  key={`${topic}-dup-${index}`}
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
