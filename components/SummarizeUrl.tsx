import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import * as ollamaService from '../services/ollamaService';
import * as groqService from '../services/groqService';
import { useSettings } from '../hooks/useSettings';
import { useSummaryHistory } from '../hooks/useSummaryHistory';
import { Summary } from '../types';
import LoadingSpinner from './LoadingSpinner';

const SummarizeUrl: React.FC = () => {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const { settings } = useSettings();
  const { addSummaries } = useSummaryHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !content.trim()) {
        setError("Please enter a URL and the article's content.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
        let result;
        if (settings.provider === 'ollama') {
            result = await ollamaService.summarizeUrl(url, content, settings.ollamaUrl, settings.ollamaModel);
        } else if (settings.provider === 'groq') {
            result = await groqService.summarizeUrl(url, content, settings.groqApiKey, settings.groqModel);
        } else {
            result = await geminiService.summarizeUrl(url, content);
        }
        
        const newSummary: Summary = {
            ...result,
            id: `url-summary-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            topicId: `url-topic-${Date.now()}`,
            sourceCount: 1,
        };
        setSummary(newSummary);
        addSummaries([newSummary]); // Add to history

    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-200 mb-2">Summarize any Article</h2>
      <p className="text-gray-400 mb-6">
        Enter the URL of a news article and paste its content below. The AI will provide a concise summary, which will also be added to your history.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="article-url" className="block text-sm font-medium text-gray-400 mb-1">Article URL</label>
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/news/article"
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="article-content" className="block text-sm font-medium text-gray-400 mb-1">Article Content</label>
          <textarea
            id="article-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the full text of the article here..."
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            disabled={isLoading}
            aria-required="true"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isLoading || !url || !content}
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      </form>

      {isLoading && <LoadingSpinner />}
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {summary && (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold bg-gray-700 text-teal-400 px-2 py-1 rounded">
              1 Source
            </span>
            <span className={`text-xs font-bold px-2 py-1 border rounded-full ${
                { Positive: 'text-green-400 border-green-400', Negative: 'text-red-400 border-red-400', Neutral: 'text-gray-400 border-gray-400'}[summary.sentiment]
            }`}>
              {summary.sentiment}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-200 mb-3">{summary.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {summary.summary}
          </p>
          <h4 className="font-semibold text-gray-300 mb-2">Key Points:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 mb-6">
            {summary.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <div className="bg-gray-800 border-t border-gray-700 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="flex flex-wrap gap-2">
              {summary.tags.map(tag => (
                <span key={tag} className="bg-teal-900/50 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarizeUrl;