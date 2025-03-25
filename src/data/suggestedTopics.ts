interface TopicCategory {
  name: string;
  topics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    name: "General Knowledge",
    topics: [
      "General Knowledge",
      "History",
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
      "Math",
      "Languages",
      "Philosophy",
      "Architecture",
    ],
  },
  {
    name: "Specific Interests",
    topics: [
      "Oscar Winners",
      "Superheroes",
      "Video Games",
      "Disgusting Foods",
      "Dinosaurs",
      "Recent TV Shows",
      "AI",
      "Urban Legends",
      "World Records",
      "Absurd Products",
      "Famous Inventions",
    ],
  },
];

export function getRandomizedTopics(): [string[], string[]] {
  return TOPIC_CATEGORIES.map((category) =>
    [...category.topics].sort(() => Math.random() - 0.5)
  ) as [string[], string[]];
}
