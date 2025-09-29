import React, { useState, useCallback } from 'react';
import { Summary } from '../types';

interface NewsCardProps {
  summary: Summary;
  onInteract: (tags: string[]) => void;
  onCompare: (topicId: string) => void;
  isRecommended?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ summary, onInteract, onCompare, isRecommended }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggleExpand = useCallback(() => {
    if (!hasInteracted) {
      onInteract(summary.tags);
      setHasInteracted(true);
    }
    setIsExpanded(prev => !prev);
  }, [hasInteracted, onInteract, summary.tags]);

  const sentimentColor = {
    Positive: 'text-green-400 border-green-400',
    Negative: 'text-red-400 border-red-400',
    Neutral: 'text-gray-400 border-gray-400',
  };
  
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from collapsing
    onCompare(summary.topicId);
  }

  return (
    <div 
      className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-teal-500/20 hover:scale-[1.02] cursor-pointer ${isRecommended ? 'border border-teal-500/50' : 'border border-transparent'}`}
      onClick={handleToggleExpand}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleToggleExpand()}
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col items-start">
            {isRecommended && (
              <span className="text-xs font-bold bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full mb-2">
                For You
              </span>
            )}
            <span className="text-xs font-semibold bg-gray-700 text-teal-400 px-2 py-1 rounded">
              {summary.sourceCount} Sources
            </span>
          </div>
          <span className={`text-xs font-bold px-2 py-1 border rounded-full ${sentimentColor[summary.sentiment]}`}>
            {summary.sentiment}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-200 mb-3">{summary.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {isExpanded ? summary.summary : `${summary.summary.substring(0, 150)}...`}
        </p>
        
        {isExpanded && (
          <>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-300 mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                {summary.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <p>Generated: {new Date(summary.generatedAt).toLocaleString()}</p>
                <p>Topic ID: {summary.topicId}</p>
              </div>
              <button
                onClick={handleCompareClick}
                className="text-sm bg-teal-600/50 text-teal-300 hover:bg-teal-600/80 font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Compare Narratives
              </button>
            </div>
          </>
        )}
      </div>
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {summary.tags.map(tag => (
            <span key={tag} className="bg-teal-900/50 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;