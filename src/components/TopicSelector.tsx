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
      <label
        htmlFor="topic"
        className="block text-sm font-medium mb-1 text-purple-200"
      >
        Topic
      </label>
      <input
        type="text"
        id="topic"
        value={value}
        onChange={handleChange}
        placeholder="Enter any topic (e.g. Animals)"
        className="w-full px-3 py-3 text-sm rounded-lg border border-gray-300 bg-purple-900/50 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
