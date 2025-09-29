import React, { useCallback } from 'react';
import { useSummaryHistory } from '../hooks/useSummaryHistory';
import NewsCard from './NewsCard';

interface HistoryProps {
  onCompare: (topicId: string) => void;
}

const History: React.FC<HistoryProps> = ({ onCompare }) => {
  const { summaries } = useSummaryHistory();

  // onInteract is a required prop for NewsCard, but doesn't need to do anything in history view
  const handleInteraction = useCallback(() => {
    // No action needed in history view for interest tracking
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-200 mb-6 border-b border-gray-700 pb-4">
        Your Summary History
      </h2>
      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {summaries.map((summary) => (
            <NewsCard
              key={summary.id}
              summary={summary}
              onInteract={handleInteraction}
              onCompare={onCompare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>Your history is empty.</p>
          <p>New summaries will appear here after they are generated.</p>
        </div>
      )}
    </div>
  );
};

export default History;