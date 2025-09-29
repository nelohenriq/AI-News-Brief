export interface NewsArticle {
  source: string;
  headline: string;
  content: string;
}

export interface NewsCluster {
  id: string;
  topic: string;
  articles: NewsArticle[];
}

export interface Summary {
  id: string;
  generatedAt: string;
  topicId: string;
  title: string;
  summary: string;
  tags: string[];
  keyPoints: string[];
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sourceCount: number;
}

export interface Interest {
  score: number;
  lastInteraction: number; // timestamp
}

export interface UserInterests {
  [tag: string]: Interest;
}

export interface Source {
  id: string;
  name: string;
  url: string;
}

export interface RssArticle {
  sourceName: string;
  title: string;
  link: string;
  contentSnippet: string;
}

export type Provider = 'gemini' | 'ollama' | 'groq';

export interface Settings {
  provider: Provider;
  ollamaUrl: string;
  ollamaModel: string;
  groqApiKey: string;
  groqModel: string;
}