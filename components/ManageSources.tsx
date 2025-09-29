import React, { useState } from 'react';
import { useNewsSources } from '../hooks/useNewsSources';
import { useSettings } from '../hooks/useSettings';
import { Source } from '../types';
import AddSourceForm from './AddSourceForm';
import * as geminiService from '../services/geminiService';
import * as ollamaService from '../services/ollamaService';
import * as groqService from '../services/groqService';

interface ManageSourcesProps {
  onNewSourceAdded: (sourceName: string) => void;
}

const ManageSources: React.FC<ManageSourcesProps> = ({ onNewSourceAdded }) => {
  const { sources, addSource, removeSource, updateSource } = useNewsSources();
  const { settings } = useSettings();
  
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSourceAdded = (name: string) => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
    onNewSourceAdded(name);
  };

  const handleStartEdit = (source: Source) => {
    setEditingId(source.id);
    setEditName(source.name);
    setEditUrl(source.url);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditUrl('');
    setEditError('');
    setIsUpdating(false);
  };

  const handleUpdateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setEditError('');
    const trimmedName = editName.trim();
    const trimmedUrl = editUrl.trim();

    if (!trimmedName || !trimmedUrl) {
      setEditError('Both name and URL are required.');
      return;
    }
    try {
      new URL(trimmedUrl);
    } catch (_) {
      setEditError('Please enter a valid URL.');
      return;
    }
    if (sources.some(s => s.id !== editingId && (s.name.toLowerCase() === trimmedName.toLowerCase() || s.url === trimmedUrl))) {
      setEditError('Another source with this name or URL already exists.');
      return;
    }
    
    setIsUpdating(true);
    try {
      if (settings.provider === 'ollama') {
        await ollamaService.validateRssFeed(trimmedUrl, settings.ollamaUrl, settings.ollamaModel);
      } else if (settings.provider === 'groq') {
        await groqService.validateRssFeed(trimmedUrl, settings.groqApiKey);
      } else {
        await geminiService.validateRssFeed(trimmedUrl);
      }
      updateSource(editingId, trimmedName, trimmedUrl);
      handleCancelEdit();
    } catch (err) {
      console.error("Validation failed:", err);
      setEditError("Source URL could not be validated as a valid RSS feed.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-200 mb-6">Manage News Sources</h2>
      
      <AddSourceForm sources={sources} addSource={addSource} onSourceAdded={handleSourceAdded} />

      {showConfirmation && (
        <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">New source added. Generating summary...</span>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-300 mb-4">Your Sources</h3>
        <div className="space-y-3">
          {sources.length > 0 ? (
            sources.map(source => (
              <div key={source.id} className="bg-gray-700 p-4 rounded-md">
                {editingId === source.id ? (
                  <form onSubmit={handleUpdateSource} className="space-y-4">
                     <div>
                        <label htmlFor={`edit-name-${source.id}`} className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                        <input id={`edit-name-${source.id}`} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"/>
                     </div>
                     <div>
                        <label htmlFor={`edit-url-${source.id}`} className="block text-xs font-medium text-gray-400 mb-1">URL</label>
                        <input id={`edit-url-${source.id}`} type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"/>
                     </div>
                     {editError && <p className="text-red-400 text-sm">{editError}</p>}
                     <div className="flex justify-end items-center gap-3">
                        <button type="button" onClick={handleCancelEdit} className="text-gray-400 hover:text-white font-semibold py-2 px-4 rounded-md text-sm">Cancel</button>
                        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isUpdating}>
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                     </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-200">{source.name}</p>
                      <p className="text-sm text-gray-500">{source.url}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => handleStartEdit(source)} aria-label={`Edit ${source.name}`} className="text-gray-500 hover:text-teal-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                       </button>
                       <button onClick={() => removeSource(source.id)} aria-label={`Remove ${source.name}`} className="text-gray-500 hover:text-red-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">You haven't added any sources yet.</p>
          )}
        </div>
      </div>
       <p className="text-xs text-gray-600 mt-8 text-center italic">
         Note: Adding a source simulates fetching and summarizing a new article.
       </p>
    </div>
  );
};

export default ManageSources;