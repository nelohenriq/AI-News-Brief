
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500"></div>
      <p className="mt-4 text-lg text-gray-400 font-semibold">
        AI is synthesizing your news...
      </p>
      <p className="text-sm text-gray-500">This may take a moment.</p>
    </div>
  );
};

export default LoadingSpinner;
