interface TopicButtonProps {
  topic: string;
  onSelect: (topic: string) => void;
}

export function TopicButton({ topic, onSelect }: TopicButtonProps) {
  return (
    <button
      onClick={() => onSelect(topic)}
      className="
        px-3 py-1.5 mx-1
        rounded-full
        bg-purple-800/50
        hover:bg-purple-700
        active:bg-purple-600
        text-white
        whitespace-nowrap
        transition-colors
        duration-200
        border border-purple-500
        backdrop-blur-sm
        text-sm
      "
    >
      {topic}
    </button>
  );
}
