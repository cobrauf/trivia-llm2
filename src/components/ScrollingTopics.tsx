"use client";

import { useMemo } from "react";
import { TOPIC_CATEGORIES } from "@/data/suggestedTopics";
import { TopicButton } from "./TopicButton";

interface ScrollingTopicsProps {
  onTopicSelect: (topic: string) => void;
}

export function ScrollingTopics({ onTopicSelect }: ScrollingTopicsProps) {
  // Get all topics from all categories
  const allTopics = useMemo(() => {
    // Flatten all categories to get a single array of topics
    const allTopics = TOPIC_CATEGORIES.flatMap((category) => category.topics);

    // Create two arrays for row1 and row2 with all topics
    const halfLength = Math.ceil(allTopics.length / 2);
    const row1 = allTopics.slice(0, halfLength);
    const row2 = allTopics.slice(halfLength);

    return [row1, row2] as [string[], string[]];
  }, []);

  const getScrollDuration = (topics: string[]) => {
    // Calculate approximate width (each topic ~150px + gap)
    const distance = topics.length * 120; // reduced from 170 to make buttons scroll faster
    return distance / 100; // Speed factor - increased denominator from 100 to 200 to make faster
  };

  const row1Duration = getScrollDuration(allTopics[0]);
  const row2Duration = getScrollDuration(allTopics[1]);

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
              {allTopics[0].map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}`}
                  topic={topic}
                  onSelect={onTopicSelect}
                />
              ))}
              {/* Duplicate the topics to create a seamless loop */}
              {allTopics[0].map((topic, index) => (
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
              {allTopics[1].map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}`}
                  topic={topic}
                  onSelect={onTopicSelect}
                />
              ))}
              {/* Duplicate the topics to create a seamless loop */}
              {allTopics[1].map((topic, index) => (
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
