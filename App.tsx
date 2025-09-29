import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import NewsCard from './components/NewsCard';
import History from './components/History';
import ManageSources from './components/ManageSources';
import SummarizeUrl from './components/SummarizeUrl';
import NarrativeComparison from './components/NarrativeComparison';
import Settings from './components/Settings';
import LoadingSpinner from './components/LoadingSpinner';
import { useSummaryHistory } from './hooks/useSummaryHistory';
import { useUserInterests } from './hooks/useUserInterests';
import { Summary, NewsCluster } from './types';
import { useSettings } from './hooks/useSettings';
import * as geminiService from './services/geminiService';
import * as ollamaService from './services/ollamaService';
import * as groqService from './services/groqService';
import { newsClusters } from './data/newsSources';

type TabId = 'for-you' | 'feed' | 'history' | 'sources' | 'summarize' | 'settings';

// This function simulates fetching a new article cluster from a newly added source.
// In a real application, this would be replaced by a backend service that
// fetches, parses, and clusters articles from the given RSS feed URL.
const getSimulatedArticleClustersForSource = (sourceName: string): NewsCluster[] => {
  const timestamp = Date.now();
  return [
    {
      id: `cluster-sim-${timestamp}-1`,
      topic: `Technological Breakthroughs reported by ${sourceName}`,
      articles: [
        {
          source: sourceName,
          headline: `Exclusive: ${sourceName} Reveals Next-Gen AI Chip`,
          content: `${sourceName} has just announced a new processor that promises to double the speed of machine learning tasks. This simulated article details the architecture and potential impact on the industry.`
        },
        {
          source: 'Simulated Tech Review',
          headline: `Analysis of ${sourceName}'s New AI Chip`,
          content: `Following the announcement from ${sourceName}, industry experts are analyzing the claims. This companion article provides a skeptical yet optimistic viewpoint on the new technology.`
        }
      ]
    },
    {
      id: `cluster-sim-${timestamp}-2`,
      topic: `Market Analysis and Predictions from ${sourceName}`,
      articles: [
        {
          source: sourceName,
          headline: `Quarterly Report: ${sourceName} Predicts Major Market Shift`,
          content: `In their latest financial report, ${sourceName} has outlined a predicted shift in consumer behavior due to recent economic events. This simulation explores their reasoning and data.`
        }
      ]
    },
    {
      id: `cluster-sim-${timestamp}-3`,
      topic: `Corporate Strategy Changes at ${sourceName}`,
      articles: [
        {
          source: sourceName,
          headline: `${sourceName} to Enter New International Markets`,
          content: `CEO of ${sourceName} confirmed plans for expansion into three new countries next year. This simulated article covers the strategic reasoning and potential challenges.`
        },
        {
          source: 'Simulated Business Journal',
          headline: `Is ${sourceName}'s Expansion a Wise Move?`,
          content: `This article provides an independent analysis of ${sourceName}'s expansion plans, comparing it to historical moves by other major corporations in the sector.`
        }
      ]
    }
  ];
};


const TABS = [
  { id: 'for-you', label: 'For You' },
  { id: 'feed', label: 'News Feed' },
  { id: 'history', label: 'History' },
  { id: 'sources', label: 'Manage Sources' },
  { id: 'summarize', label: 'Summarize URL' },
  { id: 'settings', label: 'Settings' },
];

const RECOMMENDATION_THRESHOLD = 4; // Interest score threshold for a summary to be "For You"

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [latestSummaries, setLatestSummaries] = useState<Summary[]>([]);
  const [comparingTopicId, setComparingTopicId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const { addInterest, getDecayedInterests } = useUserInterests();
  const { settings } = useSettings();
  const { summaries, addSummaries } = useSummaryHistory();
  
  useEffect(() => {
    const loadInitialData = async () => {
      // If history is empty (first-time user), fetch initial summaries
      if (summaries.length === 0 && newsClusters.length > 0) {
        setIsFetching(true);
        try {
          let initialSummaries: Summary[] = [];
          if (settings.provider === 'ollama') {
            if (settings.ollamaUrl && settings.ollamaModel) {
              initialSummaries = await ollamaService.summarizeNewsClusters(newsClusters, settings.ollamaUrl, settings.ollamaModel);
            } else {
              console.warn("Ollama provider selected but not configured. Skipping initial fetch.");
            }
          } else if (settings.provider === 'groq') {
            if (settings.groqApiKey && settings.groqModel) {
              initialSummaries = await groqService.summarizeNewsClusters(newsClusters, settings.groqApiKey, settings.groqModel);
            } else {
               console.warn("Groq provider selected but not configured. Skipping initial fetch.");
            }
          } else {
            initialSummaries = await geminiService.summarizeNewsClusters(newsClusters);
          }
          setLatestSummaries(initialSummaries);
          addSummaries(initialSummaries); // Save to history for next time
        } catch (error) {
          console.error("Failed to fetch initial summaries:", error);
        } finally {
          setIsFetching(false);
        }
      } else {
        // If history exists (returning user), populate feed from history
        setLatestSummaries(summaries);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleInteraction = useCallback((tags: string[]) => {
    tags.forEach(tag => addInterest(tag));
  }, [addInterest]);

  const handleCompare = useCallback((topicId: string) => {
    setComparingTopicId(topicId);
  }, []);

  const handleNewSourceAdded = useCallback(async (sourceName: string) => {
    setActiveTab('feed');
    setIsFetching(true);
    
    const simulatedClusters = getSimulatedArticleClustersForSource(sourceName);
    
    try {
      let newSummaries: Summary[] = [];
      if (settings.provider === 'ollama') {
        newSummaries = await ollamaService.summarizeNewsClusters(simulatedClusters, settings.ollamaUrl, settings.ollamaModel);
      } else if (settings.provider === 'groq') {
        newSummaries = await groqService.summarizeNewsClusters(simulatedClusters, settings.groqApiKey, settings.groqModel);
      } else {
        newSummaries = await geminiService.summarizeNewsClusters(simulatedClusters);
      }
      
      if (newSummaries.length > 0) {
        setLatestSummaries(prev => [...newSummaries, ...prev]);
        addSummaries(newSummaries);
      }
    } catch (error) {
      console.error("Failed to generate summary for new source:", error);
      // In a real app, you might want to show an error toast/message to the user.
    } finally {
      setIsFetching(false);
    }
  }, [settings, addSummaries]);

  const interests = useMemo(() => getDecayedInterests(), [getDecayedInterests, latestSummaries]);

  const scoredSummaries = useMemo(() => {
    return latestSummaries.map(summary => ({
      summary,
      score: summary.tags.reduce((acc, tag) => acc + (interests[tag] || 0), 0)
    }));
  }, [latestSummaries, interests]);


  const renderContent = () => {
    if (isFetching) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'for-you': {
        const recommendedSummaries = scoredSummaries
          .filter(({ score }) => score > RECOMMENDATION_THRESHOLD)
          .sort((a, b) => b.score - a.score);
          
        return recommendedSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedSummaries.map(({ summary, score }) => (
                <NewsCard 
                  key={summary.id} 
                  summary={summary}
                  onInteract={handleInteraction}
                  onCompare={handleCompare}
                  isRecommended={true}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Your "For You" Feed is Empty</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              As you read and interact with summaries in the <strong className="text-teal-400">News Feed</strong> tab, this page will fill with personalized recommendations.
            </p>
          </div>
        );
      }
      case 'feed': {
        return latestSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scoredSummaries.map(({ summary, score }) => (
                <NewsCard 
                  key={summary.id} 
                  summary={summary}
                  onInteract={handleInteraction}
                  onCompare={handleCompare}
                  isRecommended={score > RECOMMENDATION_THRESHOLD}
                />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Welcome to Your AI News Brief</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your news feed is currently empty. Add a new source via the <strong className="text-teal-400">Manage Sources</strong> tab to generate your first summary.
            </p>
             <p className="text-gray-500 mt-4 text-sm">
              Alternatively, use the <strong className="text-teal-400">Summarize URL</strong> tab to analyze a single article.
            </p>
          </div>
        );
      }
      case 'history':
        return <History onCompare={handleCompare} />;
      case 'sources':
        return <ManageSources onNewSourceAdded={handleNewSourceAdded} />;
      case 'summarize':
        return <SummarizeUrl />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabId)} />
        {renderContent()}
      </main>
      {comparingTopicId && (
        <NarrativeComparison 
          topicId={comparingTopicId}
          onClose={() => setComparingTopicId(null)}
        />
      )}
    </div>
  );
};

export default App;