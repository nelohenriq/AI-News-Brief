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

type TabId = 'for-you' | 'feed' | 'history' | 'sources' | 'summarize' | 'settings';

// This function simulates fetching a new article cluster from a newly added source.
// In a real application, this would be replaced by a backend service that
// fetches, parses, and clusters articles from the given RSS feed URL.
const getSimulatedArticleClusterForSource = (sourceName: string): NewsCluster => {
  return {
    id: `cluster-sim-${Date.now()}`,
    topic: `Recent Developments from ${sourceName}`,
    articles: [
      {
        source: sourceName,
        headline: `Exclusive Report: ${sourceName} Unveils New Initiative`,
        content: `In a surprising move, ${sourceName} has announced a new strategic initiative aimed at revolutionizing its sector. This article provides a simulated overview of what this means for the industry and consumers. The content is generic to demonstrate the AI's ability to process and summarize new information as sources are added to the system. This demonstrates the reactive nature of the news feed.`
      },
      {
        source: 'Associated News Sim',
        headline: `Industry Reacts to ${sourceName}'s Latest Announcement`,
        content: `Following the recent announcement from ${sourceName}, analysts are weighing in. This simulated companion article offers a different perspective, creating a multi-source cluster for the AI to synthesize. This process mimics how the application would handle real-world news events covered by multiple outlets.`
      }
    ]
  };
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
  const [activeTab, setActiveTab] = useState<TabId>('for-you');
  const [latestSummaries, setLatestSummaries] = useState<Summary[]>([]);
  const [comparingTopicId, setComparingTopicId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const { addInterest, getDecayedInterests } = useUserInterests();
  const { settings } = useSettings();
  const { addSummaries } = useSummaryHistory();
  
  const handleInteraction = useCallback((tags: string[]) => {
    tags.forEach(tag => addInterest(tag));
  }, [addInterest]);

  const handleCompare = useCallback((topicId: string) => {
    setComparingTopicId(topicId);
  }, []);

  const handleNewSourceAdded = useCallback(async (sourceName: string) => {
    setActiveTab('feed');
    setIsFetching(true);
    
    const simulatedCluster = getSimulatedArticleClusterForSource(sourceName);
    
    try {
      let newSummaries: Summary[];
      if (settings.provider === 'ollama') {
        newSummaries = await ollamaService.summarizeNewsClusters([simulatedCluster], settings.ollamaUrl, settings.ollamaModel);
      } else {
        newSummaries = await geminiService.summarizeNewsClusters([simulatedCluster]);
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