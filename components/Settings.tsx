import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Provider } from '../types';
import { testConnection, getModels } from '../services/ollamaService';
import ManageInterests from './ManageInterests';

const Settings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  const [provider, setProvider] = useState<Provider>(settings.provider);
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(settings.ollamaModel);

  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleTestConnection = useCallback(async () => {
    setConnectionStatus('testing');
    setFetchError(null);
    const isConnected = await testConnection(ollamaUrl);
    if (isConnected) {
      try {
        const models = await getModels(ollamaUrl);
        setOllamaModels(models);
        setConnectionStatus('success');
        if (models.length > 0 && !models.includes(ollamaModel)) {
          setOllamaModel(models[0]);
        }
      } catch (error: any) {
        setConnectionStatus('failed');
        setFetchError(error.message || 'Failed to fetch models.');
        setOllamaModels([]);
      }
    } else {
      setConnectionStatus('failed');
      setFetchError('Could not connect to the Ollama server.');
      setOllamaModels([]);
    }
  }, [ollamaUrl, ollamaModel]);

  useEffect(() => {
    // Auto-test connection on load if Ollama is the selected provider
    if (settings.provider === 'ollama') {
      handleTestConnection();
    }
  }, [settings.provider, handleTestConnection]);


  const handleSave = () => {
    saveSettings({
      provider,
      ollamaUrl,
      ollamaModel,
    });
    alert('Settings saved!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-200 mb-2">AI Provider Settings</h2>
          <p className="text-gray-400">Choose and configure your preferred AI provider for news summarization.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-300">Select Provider</label>
          <div className="flex gap-4 p-2 bg-gray-900/50 rounded-lg">
            <button onClick={() => setProvider('gemini')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${provider === 'gemini' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              Gemini API
            </button>
            <button onClick={() => setProvider('ollama')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${provider === 'ollama' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              Ollama (Local)
            </button>
          </div>
        </div>
        
        {provider === 'ollama' && (
          <div className="border-t border-gray-700 pt-8 space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-teal-400">Ollama Configuration</h3>
            <div>
              <label htmlFor="ollama-url" className="block text-sm font-medium text-gray-400 mb-1">Ollama Server URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  id="ollama-url"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'testing'}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                >
                  {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              {connectionStatus === 'success' && <p className="text-green-400 text-sm mt-2">Connection successful! Models loaded.</p>}
              {connectionStatus === 'failed' && <p className="text-red-400 text-sm mt-2">Connection failed. {fetchError}</p>}
            </div>

            <div>
              <label htmlFor="ollama-model" className="block text-sm font-medium text-gray-400 mb-1">Select Model</label>
              <select 
                id="ollama-model"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                disabled={ollamaModels.length === 0}
                className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                {ollamaModels.length > 0 ? (
                  <>
                    <option value="" disabled>-- Select a model --</option>
                    {ollamaModels.map(modelName => (
                      <option key={modelName} value={modelName}>{modelName}</option>
                    ))}
                  </>
                ) : (
                  <option>{connectionStatus === 'testing' ? 'Loading models...' : 'No models found'}</option>
                )}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-8 rounded-md transition-colors">
            Save Settings
          </button>
        </div>
      </div>

      <ManageInterests />
    </div>
  );
};

export default Settings;