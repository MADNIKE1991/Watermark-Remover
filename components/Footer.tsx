
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-brand-gray-800 border-t border-brand-gray-200 dark:border-brand-gray-700 mt-8">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-brand-gray-500 dark:text-brand-gray-400">
        <p className="font-semibold">Privacy & Ethics Notice</p>
        <p className="mt-2 max-w-2xl mx-auto">
          This application processes images using Google's Gemini API. Your images are not stored on our servers. Please be responsible and respect copyright laws when using this tool. Only remove watermarks from images you have the right to modify.
        </p>
        <p className="mt-4">
          &copy; {new Date().getFullYear()} AI Watermark Remover. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
