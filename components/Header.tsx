
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-teal-500 tracking-wider">
          AI News Brief
        </h1>
        <p className="text-gray-500">Your Daily Synthesized News</p>
      </div>
    </header>
  );
};

export default Header;
