interface TopicCategory {
  name: string;
  topics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    name: "General Knowledge",
    topics: [
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
      "Mathematics",
      "Languages",
      "Philosophy",
      "Architecture",
    ],
  },
  {
    name: "Specific Interests",
    topics: [
      "Ancient Egypt",
      "Space Exploration",
      "Wildlife",
      "Olympic Games",
      "Famous Inventions",
      "World Cuisine",
      "Classic Rock",
      "Superheroes",
      "Video Games",
      "Famous Artists",
      "Dinosaurs",
      "Mythology",
      "Jazz Music",
      "Artificial Intelligence",
      "Ocean Life",
      "Medieval History",
    ],
  },
];

export function getRandomizedTopics(): [string[], string[]] {
  return TOPIC_CATEGORIES.map((category) =>
    [...category.topics].sort(() => Math.random() - 0.5)
  ) as [string[], string[]];
}
