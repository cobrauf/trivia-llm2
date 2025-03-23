interface TopicCategory {
  name: string;
  topics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    name: "General Knowledge",
    topics: [
      "History",
      "Wildlife",
      "Geography",
      "Science",
      "Art",
      "Literature",
      "Music",
      "Movies",
      "Sports",
      "Food",
      "Technology",
      "Politics",
      "Nature",
      "Mathematics",
      "Languages",
      "Philosophy",
      "Architecture",
    ],
  },
  {
    name: "Specific Interests",
    topics: [
      "Space Exploration",
      "Olympic Games",
      "Famous Inventions",
      "Dad Jokes",
      "Disgusting Foods",
      "Superheroes",
      "Video Games",
      "Dinosaurs",
      "Artificial Intelligence",
      "Ridiculous World Records",
      "Most Absurd Products",
    ],
  },
];

export function getRandomizedTopics(): [string[], string[]] {
  return TOPIC_CATEGORIES.map((category) =>
    [...category.topics].sort(() => Math.random() - 0.5)
  ) as [string[], string[]];
}
