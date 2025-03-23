"use client";

import { useMemo } from "react";
import { TOPIC_CATEGORIES } from "@/data/suggestedTopics";
import { TopicButton } from "./TopicButton";

interface ScrollingTopicsProps {
  onTopicSelect: (topic: string) => void;
}

export function ScrollingTopics({ onTopicSelect }: ScrollingTopicsProps) {
  // Client-side randomization
  const [row1Topics, row2Topics] = useMemo(() => {
    return TOPIC_CATEGORIES.map((category) =>
      [...category.topics].sort(() => Math.random() - 0.5)
    ) as [string[], string[]];
  }, []);

  const getScrollDuration = (topics: string[]) => {
    // Calculate approximate width (each topic ~150px + gap)
    const distance = topics.length * 170;
    return distance / 100; // Speed factor - increase denominator to make faster
  };

  const row1Duration = getScrollDuration(row1Topics);
  const row2Duration = getScrollDuration(row2Topics);

  return (
    <div className="w-full mb-8">
      <div className="space-y-3">
        {/* First row - scrolling right */}
        <div className="overflow-hidden py-1">
          <div className="relative">
            <div
              className="flex items-center whitespace-nowrap gap-3 px-3"
              style={{
                animation: `scroll-right ${row1Duration}s linear infinite`,
                willChange: "transform",
              }}
            >
              {row1Topics.map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}`}
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
              className="flex items-center whitespace-nowrap gap-3 px-3"
              style={{
                animation: `scroll-left ${row2Duration}s linear infinite`,
                willChange: "transform",
              }}
            >
              {row2Topics.map((topic, index) => (
                <TopicButton
                  key={`${topic}-${index}`}
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
