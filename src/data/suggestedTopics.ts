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
      "Internet Memes", // Modern, fun
      "Board Games", // Specific interest, fun
      "Anime & Manga", // Specific interest, popular
      "K-Pop", // Modern, specific interest, popular
      "Reality TV", // Modern, popular culture
      "True Crime Stories", // Interesting, popular genre
      "Social Media", // Modern, dynamic
      "Cocktails", // Specific interest, related to Food but distinct niche
      "Mythical Creatures",
    ],
  },
];

export function getRandomizedTopics(): [string[], string[]] {
  return TOPIC_CATEGORIES.map((category) =>
    [...category.topics].sort(() => Math.random() - 0.5)
  ) as [string[], string[]];
}
