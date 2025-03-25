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
      "Famous Inventions",
      "Oscar Winners",
      "Superheroes",
      "Video Games",
      "Disgusting Foods",
      "Dinosaurs",
      "Artificial Intelligence",
      "Ridiculous World Records",
      "Absurd Products",
    ],
  },
];

export function getRandomizedTopics(): [string[], string[]] {
  return TOPIC_CATEGORIES.map((category) =>
    [...category.topics].sort(() => Math.random() - 0.5)
  ) as [string[], string[]];
}
