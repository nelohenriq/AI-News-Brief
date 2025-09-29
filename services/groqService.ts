import { NewsCluster, Summary, RssArticle } from "../types";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";

const generateWithGroq = async (prompt: string, apiKey: string, model: string) => {
    if (!apiKey) {
        throw new Error("Groq API Key must be configured in Settings.");
    }
    if (!model) {
        throw new Error("Groq model must be configured in Settings.");
    }
    
    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Groq API Error:", errorBody);
        throw new Error(`Failed to communicate with Groq API. Status: ${response.status} - ${errorBody.error?.message}`);
    }

    const data = await response.json();
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("Failed to parse Groq response as JSON:", data.choices[0].message.content);
        throw new Error("Groq returned a non-JSON response.");
    }
};

export const testConnection = async (apiKey: string) => {
    if (!apiKey) return false;
    try {
        const response = await fetch(`${GROQ_API_BASE}/models`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return response.ok;
    } catch (error) {
        console.error("Groq connection test failed:", error);
        return false;
    }
};

export const getModels = async (apiKey: string): Promise<string[]> => {
    try {
        const response = await fetch(`${GROQ_API_BASE}/models`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
        const data = await response.json();
        // The previous filter was too restrictive. All modern chat models from Groq
        // support JSON mode, so we will return all available models.
        return data.data.map((m: any) => m.id);
    } catch (error) {
        console.error("Failed to fetch Groq models:", error);
        throw new Error("Could not fetch models from the Groq API.");
    }
};

export const summarizeNewsClusters = async (clusters: NewsCluster[], apiKey: string, model: string): Promise<Summary[]> => {
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
            const result = await generateWithGroq(prompt, apiKey, model);
            summaries.push({
                ...result,
                id: `summary-${cluster.id}-${Date.now()}`,
                generatedAt: new Date().toISOString(),
                topicId: cluster.id,
                sourceCount: cluster.articles.length,
            });
        } catch (error) {
            console.error(`Failed to summarize cluster "${cluster.topic}" with Groq:`, error);
        }
    }

    return summaries;
};

export const validateRssFeed = async (url: string, apiKey: string): Promise<{ isValid: boolean; articles: Omit<RssArticle, 'sourceName' | 'link'>[] }> => {
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

export const summarizeUrl = async (url: string, content: string, apiKey: string, model: string): Promise<Omit<Summary, 'id' | 'topicId' | 'sourceCount' | 'generatedAt'>> => {
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
        return await generateWithGroq(prompt, apiKey, model);
    } catch (error) {
        console.error(`Failed to summarize URL "${url}" with Groq:`, error);
        throw new Error("Failed to generate summary for the provided URL.");
    }
};