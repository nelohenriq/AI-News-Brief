import React, { useMemo } from 'react';
import { useUserInterests } from '../hooks/useUserInterests';

const ManageInterests: React.FC = () => {
    const { getDecayedInterests, adjustInterest, removeInterest } = useUserInterests();

    const interests = useMemo(() => {
        const decayed = getDecayedInterests();
        // FIX: Refactor sorting logic to be more type-safe and avoid arithmetic errors on potentially mis-inferred types.
        return Object.keys(decayed)
            .sort((tagA, tagB) => decayed[tagB] - decayed[tagA])
            .map((tag) => ({ tag, score: decayed[tag] }));
    }, [getDecayedInterests]);

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <div>
                <h2 className="text-3xl font-bold text-gray-200 mb-2">Manage Your Interests</h2>
                <p className="text-gray-400">Fine-tune your 'For You' recommendations by adjusting the scores of topics you've interacted with.</p>
            </div>

            <div className="mt-6 border-t border-gray-700 pt-6">
                {interests.length > 0 ? (
                    <div className="space-y-3">
                        {interests.map(({ tag, score }) => (
                            <div key={tag} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-200">{tag}</p>
                                    <p className="text-xs text-gray-500">Current Score: {score.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => adjustInterest(tag, 1)}
                                        className="bg-green-500/20 text-green-300 h-8 w-8 rounded-full font-bold text-lg hover:bg-green-500/40 transition-colors"
                                        aria-label={`Increase score for ${tag}`}
                                    >+</button>
                                    <button 
                                        onClick={() => adjustInterest(tag, -1)}
                                        className="bg-yellow-500/20 text-yellow-300 h-8 w-8 rounded-full font-bold text-lg hover:bg-yellow-500/40 transition-colors"
                                        aria-label={`Decrease score for ${tag}`}
                                    >-</button>
                                     <button 
                                        onClick={() => removeInterest(tag)}
                                        className="bg-red-500/20 text-red-300 h-8 w-8 rounded-full font-bold text-lg hover:bg-red-500/40 transition-colors"
                                        aria-label={`Remove ${tag}`}
                                    >&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Your tracked interests will appear here once you start interacting with news summaries.</p>
                )}
            </div>
        </div>
    );
};

export default ManageInterests;
