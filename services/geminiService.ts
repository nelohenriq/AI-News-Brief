import { GoogleGenAI, Type } from "@google/genai";
import { NewsCluster, Summary, RssArticle } from "../types";

// FIX: Initialize the GoogleGenAI client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise, neutral headline for the topic.",
    },
    summary: {
      type: Type.STRING,
      description: "A comprehensive summary that integrates the key information from all articles.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 relevant topic tags (e.g., 'Technology', 'Geopolitics', 'Finance').",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 distinct key bullet points from the summary.",
    },
    sentiment: {
      type: Type.STRING,
      enum: ["Positive", "Negative", "Neutral"],
      description: "The overall sentiment of the news cluster.",
    },
  },
  required: ["title", "summary", "tags", "keyPoints", "sentiment"],
};


export const summarizeNewsClusters = async (clusters: NewsCluster[]): Promise<Summary[]> => {
  const summaries: Summary[] = [];

  for (const cluster of clusters) {
    const articlesContent = cluster.articles.map(a => `Source: ${a.source}\nHeadline: ${a.headline}\nContent: ${a.content}`).join('\n\n---\n\n');
    const prompt = `You are a sophisticated AI news analyst. Your task is to process a cluster of news articles about a single topic ("${cluster.topic}") and generate a synthesized, neutral summary.
From the provided articles below, you must:
1.  Create a concise, neutral headline for the topic.
2.  Write a comprehensive summary that integrates the key information from all articles.
3.  Extract 3-5 distinct key bullet points.
4.  Generate 3-5 relevant topic tags (e.g., 'Technology', 'Geopolitics', 'Finance').
5.  Analyze the overall sentiment of the news cluster: 'Positive', 'Negative', or 'Neutral'.

Respond ONLY with a JSON object that strictly adheres to the provided schema.

ARTICLES:
${articlesContent}
`;

    try {
      // FIX: Use the correct method to generate content with JSON output.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: summarySchema,
        },
      });

      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);

      summaries.push({
        ...result,
        id: `summary-${cluster.id}-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        topicId: cluster.id,
        sourceCount: cluster.articles.length,
      });

    } catch (error) {
      console.error(`Failed to summarize cluster "${cluster.topic}":`, error);
      // In a real app, you might want to return a partial result or a specific error object.
      // For this demo, we'll just skip the failed one.
    }
  }

  return summaries;
};

export const validateRssFeed = async (url: string): Promise<{ isValid: boolean; articles: Omit<RssArticle, 'sourceName' | 'link'>[] }> => {
    // This is a placeholder validation to avoid making an API call.
    // In a real app, this would involve server-side fetching and parsing due to CORS.
    try {
        new URL(url);
        // Return a successful validation without hitting the API.
        return Promise.resolve({
            isValid: true,
            articles: [
                { title: "Validation Successful", contentSnippet: "This URL appears to be valid." }
            ]
        });
    } catch (error) {
        return Promise.reject(new Error("The provided URL is not valid."));
    }
}

export const summarizeUrl = async (url: string, content: string): Promise<Omit<Summary, 'id' | 'topicId' | 'sourceCount' | 'generatedAt'>> => {
    const prompt = `You are a sophisticated AI news analyst. Your task is to analyze the content of the article from the URL "${url}" and generate a synthesized, neutral summary.
From the provided article content below, you must:
1.  Create a concise, neutral headline for the topic.
2.  Write a comprehensive summary that integrates the key information from the article.
3.  Extract 3-5 distinct key bullet points.
4.  Generate 3-5 relevant topic tags (e.g., 'Technology', 'Geopolitics', 'Finance').
5.  Analyze the overall sentiment of the article: 'Positive', 'Negative', or 'Neutral'.

Respond ONLY with a JSON object that strictly adheres to the provided schema.

ARTICLE CONTENT:
${content}
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: summarySchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error(`Failed to summarize URL "${url}":`, error);
        throw new Error("Failed to generate summary for the provided URL.");
    }
};