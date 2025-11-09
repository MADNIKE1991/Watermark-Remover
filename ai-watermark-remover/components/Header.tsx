
import React from 'react';
import { MagicWandIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-brand-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <MagicWandIcon className="h-8 w-8 text-brand-blue" />
            <h1 className="ml-3 text-2xl font-bold text-brand-gray-800 dark:text-brand-gray-100">
              AI Watermark Remover
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};
