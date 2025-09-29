import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Provider } from '../types';
import * as ollamaService from '../services/ollamaService';
import * as groqService from '../services/groqService';
import ManageInterests from './ManageInterests';

const Settings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  const [provider, setProvider] = useState<Provider>(settings.provider);
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(settings.ollamaModel);
  const [groqApiKey, setGroqApiKey] = useState(settings.groqApiKey);
  const [groqModel, setGroqModel] = useState(settings.groqModel);

  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaConnectionStatus, setOllamaConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [ollamaFetchError, setOllamaFetchError] = useState<string | null>(null);
  
  const [groqModels, setGroqModels] = useState<string[]>([]);
  const [groqConnectionStatus, setGroqConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [groqFetchError, setGroqFetchError] = useState<string | null>(null);


  const handleTestOllamaConnection = useCallback(async () => {
    setOllamaConnectionStatus('testing');
    setOllamaFetchError(null);
    const isConnected = await ollamaService.testConnection(ollamaUrl);
    if (isConnected) {
      try {
        const models = await ollamaService.getModels(ollamaUrl);
        setOllamaModels(models);
        setOllamaConnectionStatus('success');
        if (models.length > 0 && !models.includes(ollamaModel)) {
          setOllamaModel(models[0]);
        }
      } catch (error: any) {
        setOllamaConnectionStatus('failed');
        setOllamaFetchError(error.message || 'Failed to fetch models.');
        setOllamaModels([]);
      }
    } else {
      setOllamaConnectionStatus('failed');
      setOllamaFetchError('Could not connect to the Ollama server.');
      setOllamaModels([]);
    }
  }, [ollamaUrl, ollamaModel]);

  const handleTestGroqConnection = useCallback(async () => {
    if (!groqApiKey) {
      setGroqConnectionStatus('failed');
      setGroqFetchError('API Key is required.');
      return;
    }
    setGroqConnectionStatus('testing');
    setGroqFetchError(null);
    setGroqModels([]);
    const isConnected = await groqService.testConnection(groqApiKey);
    if (isConnected) {
        try {
            const models = await groqService.getModels(groqApiKey);
            setGroqModels(models);
            setGroqConnectionStatus('success');
            setGroqModel(currentModel => {
                if (models.length > 0 && !models.includes(currentModel)) {
                    return models[0];
                }
                return currentModel;
            });
        } catch (error: any) {
            setGroqConnectionStatus('failed');
            setGroqFetchError(error.message || 'Failed to fetch models.');
            setGroqModels([]);
        }
    } else {
        setGroqConnectionStatus('failed');
        setGroqFetchError('Connection failed. Check API key and network.');
        setGroqModels([]);
    }
  }, [groqApiKey]);

  useEffect(() => {
    if (settings.provider === 'ollama' && settings.ollamaUrl) {
      handleTestOllamaConnection();
    } else if (settings.provider === 'groq' && settings.groqApiKey) {
      handleTestGroqConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.provider, settings.ollamaUrl, settings.groqApiKey]);


  const handleSave = () => {
    saveSettings({
      provider,
      ollamaUrl,
      ollamaModel,
      groqApiKey,
      groqModel,
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
          <div className="grid grid-cols-3 gap-2 p-2 bg-gray-900/50 rounded-lg">
            <button onClick={() => setProvider('gemini')} className={`py-2 px-4 rounded-md font-semibold transition-colors ${provider === 'gemini' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              Gemini
            </button>
            <button onClick={() => setProvider('ollama')} className={`py-2 px-4 rounded-md font-semibold transition-colors ${provider === 'ollama' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              Ollama
            </button>
            <button onClick={() => setProvider('groq')} className={`py-2 px-4 rounded-md font-semibold transition-colors ${provider === 'groq' ? 'bg-teal-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              Groq
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
                  onClick={handleTestOllamaConnection}
                  disabled={ollamaConnectionStatus === 'testing'}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                >
                  {ollamaConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              {ollamaConnectionStatus === 'success' && <p className="text-green-400 text-sm mt-2">Connection successful! Models loaded.</p>}
              {ollamaConnectionStatus === 'failed' && <p className="text-red-400 text-sm mt-2">Connection failed. {ollamaFetchError}</p>}
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
                  <option>{ollamaConnectionStatus === 'testing' ? 'Loading models...' : 'No models found'}</option>
                )}
              </select>
            </div>
          </div>
        )}

        {provider === 'groq' && (
            <div className="border-t border-gray-700 pt-8 space-y-6 animate-fade-in">
                <h3 className="text-xl font-semibold text-teal-400">Groq Configuration</h3>
                <div>
                    <label htmlFor="groq-api-key" className="block text-sm font-medium text-gray-400 mb-1">Groq API Key</label>
                    <div className="flex gap-3">
                        <input
                            type="password"
                            id="groq-api-key"
                            value={groqApiKey}
                            onChange={(e) => setGroqApiKey(e.target.value)}
                            placeholder="gsk_..."
                            className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        <button
                            onClick={handleTestGroqConnection}
                            disabled={groqConnectionStatus === 'testing' || !groqApiKey}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {groqConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                        </button>
                    </div>
                    {groqConnectionStatus === 'success' && <p className="text-green-400 text-sm mt-2">Connection successful! Models loaded.</p>}
                    {groqConnectionStatus === 'failed' && <p className="text-red-400 text-sm mt-2">Connection failed. {groqFetchError}</p>}
                </div>
                 <div>
                    <label htmlFor="groq-model" className="block text-sm font-medium text-gray-400 mb-1">Select Model</label>
                    <select
                        id="groq-model"
                        value={groqModel}
                        onChange={(e) => setGroqModel(e.target.value)}
                        disabled={groqModels.length === 0 || groqConnectionStatus === 'testing'}
                        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                        {groqModels.length > 0 ? (
                            <>
                                <option value="" disabled>-- Select a model --</option>
                                {groqModels.map(modelName => (
                                    <option key={modelName} value={modelName}>{modelName}</option>
                                ))}
                            </>
                        ) : (
                            <option>{groqConnectionStatus === 'testing' ? 'Loading models...' : 'No models found'}</option>
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