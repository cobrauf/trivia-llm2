import { useMemo } from "react";
import { getRandomizedTopics } from "@/data/suggestedTopics";
import { TopicButton } from "./TopicButton";

interface ScrollingTopicsProps {
  onTopicSelect: (topic: string) => void;
}

export function ScrollingTopics({ onTopicSelect }: ScrollingTopicsProps) {
  const [row1Topics, row2Topics] = useMemo(() => getRandomizedTopics(), []);

  // Duplicate topics for seamless scrolling
  const row1Content = [...row1Topics, ...row1Topics];
  const row2Content = [...row2Topics, ...row2Topics];

  return (
    <div className="w-full space-y-2 mb-2">
      {/* First row - scrolling right */}
      <div className="overflow-hidden fade-edges">
        <div className="flex whitespace-nowrap scroll-right">
          {row1Content.map((topic, index) => (
            <TopicButton
              key={`${topic}-${index}`}
              topic={topic}
              onSelect={onTopicSelect}
            />
          ))}
        </div>
      </div>

      {/* Second row - scrolling left */}
      <div className="overflow-hidden fade-edges">
        <div className="flex whitespace-nowrap scroll-left">
          {row2Content.map((topic, index) => (
            <TopicButton
              key={`${topic}-${index}`}
              topic={topic}
              onSelect={onTopicSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
