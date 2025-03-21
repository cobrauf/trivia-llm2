import { ChangeEvent } from "react";

interface TopicSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TopicSelector({ value, onChange }: TopicSelectorProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      <label htmlFor="topic" className="block text-sm font-medium mb-2">
        Topic
      </label>
      <input
        type="text"
        id="topic"
        value={value}
        onChange={handleChange}
        placeholder="Enter a topic (e.g. Science, History)"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
