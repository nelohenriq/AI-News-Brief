import { NewsCluster, Summary, RssArticle } from "../types";

// Helper to extract JSON from a string that might contain markdown backticks
const extractJson = (text: string): any => {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        return JSON.parse(match[1]);
    }
    // Fallback for cases where the model doesn't use markdown
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Ollama response as JSON:", text);
        throw new Error("Ollama returned a non-JSON response.");
    }
};


const generateWithOllama = async (prompt: string, ollamaUrl: string, model: string) => {
    if (!ollamaUrl || !model) {
        throw new Error("Ollama URL and model must be configured in Settings.");
    }
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            prompt,
            format: 'json',
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Ollama API Error:", errorBody);
        throw new Error(`Failed to communicate with Ollama server. Status: ${response.status}`);
    }

    const data = await response.json();
    return extractJson(data.response);
};

export const testConnection = async (ollamaUrl: string) => {
    try {
        const response = await fetch(ollamaUrl);
        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
        return true;
    } catch (error) {
        console.error("Ollama connection test failed:", error);
        return false;
    }
};

export const getModels = async (ollamaUrl: string): Promise<string[]> => {
    try {
        const response = await fetch(`${ollamaUrl}/api/tags`);
        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
        const data = await response.json();
        return data.models.map((m: any) => m.name);
    } catch (error) {
        console.error("Failed to fetch Ollama models:", error);
        throw new Error("Could not fetch models from the Ollama server.");
    }
};


export const summarizeNewsClusters = async (clusters: NewsCluster[], ollamaUrl: string, model: string): Promise<Summary[]> => {
    const summaries: Summary[] = [];

    for (const cluster of clusters) {
        const articlesContent = cluster.articles.map(a => `Source: ${a.source}\nHeadline: ${a.headline}\nContent: ${a.content}`).join('\n\n---\n\n');
        const prompt = `You are a sophisticated AI news analyst. Your task is to process a cluster of news articles about a single topic ("${cluster.topic}") and generate a synthesized, neutral summary.
From the provided articles below, you must:
1.  Create a "title": A concise, neutral headline for the topic.
2.  Write a "summary": A comprehensive summary that integrates the key information from all articles.
3.  Generate "tags": An array of 3-5 relevant topic tags (e.g., 'Technology', 'Geopolitics', 'Finance').
4.  Extract "keyPoints": An array of 3-5 distinct key bullet points from the summary.
5.  Analyze the "sentiment": The overall sentiment of the news cluster, which must be one of 'Positive', 'Negative', or 'Neutral'.

Respond ONLY with a single, valid JSON object that strictly adheres to this structure. Do not include any other text, explanations, or markdown formatting.

ARTICLES:
${articlesContent}
`;

        try {
            const result = await generateWithOllama(prompt, ollamaUrl, model);
            summaries.push({
                ...result,
                id: `summary-${cluster.id}-${Date.now()}`,
                generatedAt: new Date().toISOString(),
                topicId: cluster.id,
                sourceCount: cluster.articles.length,
            });
        } catch (error) {
            console.error(`Failed to summarize cluster "${cluster.topic}" with Ollama:`, error);
        }
    }

    return summaries;
};


export const validateRssFeed = async (url: string, ollamaUrl: string, model: string): Promise<{ isValid: boolean; articles: Omit<RssArticle, 'sourceName' | 'link'>[] }> => {
    // This is a placeholder validation to avoid making an API call.
    try {
        new URL(url);
        return Promise.resolve({
            isValid: true,
            articles: [{ title: "Validation Successful", contentSnippet: "This URL appears to be valid." }],
        });
    } catch (error) {
        throw new Error("The provided URL is not valid.");
    }
};

export const summarizeUrl = async (url: string, content: string, ollamaUrl: string, model: string): Promise<Omit<Summary, 'id' | 'topicId' | 'sourceCount' | 'generatedAt'>> => {
    const prompt = `You are a sophisticated AI news analyst. Your task is to analyze the content of the article from the URL "${url}" and generate a synthesized, neutral summary.
From the provided article content below, you must generate a JSON object with the following properties:
1.  "title": A concise, neutral headline for the topic.
2.  "summary": A comprehensive summary of the article.
3.  "keyPoints": An array of 3-5 distinct key bullet points.
4.  "tags": An array of 3-5 relevant topic tags.
5.  "sentiment": The overall sentiment of the article ('Positive', 'Negative', or 'Neutral').

Respond ONLY with a single, valid JSON object. Do not include any other text or explanations.

ARTICLE CONTENT:
${content}
`;
    try {
        return await generateWithOllama(prompt, ollamaUrl, model);
    } catch (error) {
        console.error(`Failed to summarize URL "${url}" with Ollama:`, error);
        throw new Error("Failed to generate summary for the provided URL.");
    }
};