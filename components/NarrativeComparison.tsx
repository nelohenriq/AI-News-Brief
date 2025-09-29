import React from 'react';
import { useSummaryHistory } from '../hooks/useSummaryHistory';
import { generateDiff, DiffResult } from '../utils/diff';

interface NarrativeComparisonProps {
  topicId: string;
  onClose: () => void;
}

const DiffViewer: React.FC<{ diff: DiffResult[] }> = ({ diff }) => (
  <span>
    {diff.map((part, index) => (
      <span
        key={index}
        className={
          part.added
            ? 'bg-green-900/60 text-green-300'
            : part.removed
            ? 'bg-red-900/60 text-red-400 line-through'
            : ''
        }
      >
        {part.value}
      </span>
    ))}
  </span>
);

const NarrativeComparison: React.FC<NarrativeComparisonProps> = ({ topicId, onClose }) => {
  const { summaries } = useSummaryHistory();

  const topicSummaries = summaries
    .filter(s => s.topicId === topicId)
    .sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-teal-400">Narrative Comparison</h2>
            <p className="text-gray-400 text-sm">Topic ID: {topicId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <main className="overflow-y-auto p-6 space-y-8">
          {topicSummaries.map((summary, index) => {
            const prevSummary = index > 0 ? topicSummaries[index - 1] : null;
            const summaryDiff = prevSummary ? generateDiff(prevSummary.summary, summary.summary) : [{ value: summary.summary }];
            const keyPointsDiffs = summary.keyPoints.map((point, i) => {
              const prevPoint = prevSummary?.keyPoints[i];
              return prevPoint ? generateDiff(prevPoint, point) : [{ value: point, added: true }];
            });

            return (
              <div key={summary.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-200">{summary.title}</h3>
                  <span className="text-xs text-gray-500">{new Date(summary.generatedAt).toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-400 mb-1 text-sm">Summary:</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      <DiffViewer diff={summaryDiff} />
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2 text-sm">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {keyPointsDiffs.map((diff, i) => (
                        <li key={i}><DiffViewer diff={diff} /></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default NarrativeComparison;