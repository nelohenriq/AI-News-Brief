import React, { useState } from 'react';
import { Source } from '../types';
import { useSettings } from '../hooks/useSettings';
import * as geminiService from '../services/geminiService';
import * as ollamaService from '../services/ollamaService';


interface AddSourceFormProps {
  sources: Source[];
  addSource: (name: string, url: string) => void;
  onSourceAdded: (name: string) => void;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ sources, addSource, onSourceAdded }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName || !trimmedUrl) {
      setError('Both name and URL are required.');
      return;
    }
    
    try {
      new URL(trimmedUrl);
    } catch (_) {
      setError('Please enter a valid URL.');
      return;
    }
    
    if (sources.some(s => s.name.toLowerCase() === trimmedName.toLowerCase() || s.url === trimmedUrl)) {
      setError('A source with this name or URL already exists.');
      return;
    }
    
    setIsValidating(true);
    try {
      if (settings.provider === 'ollama') {
        await ollamaService.validateRssFeed(trimmedUrl, settings.ollamaUrl, settings.ollamaModel);
      } else {
        await geminiService.validateRssFeed(trimmedUrl);
      }
      
      addSource(trimmedName, trimmedUrl);
      setName('');
      setUrl('');
      onSourceAdded(trimmedName);
    } catch (err: any) {
      console.error("Validation failed:", err);
      setError(err.message || "Source URL could not be validated as a valid RSS feed.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-lg mb-8">
      <h3 className="text-xl font-semibold text-teal-400 mb-4">Add a New Source</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="source-name" className="block text-sm font-medium text-gray-400 mb-1">Source Name</label>
          <input
            type="text"
            id="source-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Independent Tech News"
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            aria-describedby="name-error"
          />
        </div>
        <div>
          <label htmlFor="source-url" className="block text-sm font-medium text-gray-400 mb-1">RSS Feed URL</label>
          <input
            type="url"
            id="source-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            aria-describedby="url-error"
          />
        </div>
        {error && <p id="name-error" className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!name || !url || isValidating}
          >
            {isValidating ? 'Validating...' : 'Add Source'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSourceForm;