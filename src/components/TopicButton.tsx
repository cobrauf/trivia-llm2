interface TopicButtonProps {
  topic: string;
  onSelect: (topic: string) => void;
}

export function TopicButton({ topic, onSelect }: TopicButtonProps) {
  return (
    <button
      onClick={() => onSelect(topic)}
      className="
        px-3 py-1.5
        rounded-full
        bg-purple-800/30
        hover:bg-purple-700/50
        active:bg-purple-600/70
        text-white/90
        hover:text-white
        whitespace-nowrap
        transition-colors
        duration-200
        border border-purple-500/20
        backdrop-blur-sm
        text-sm
      "
    >
      {topic}
    </button>
  );
}
