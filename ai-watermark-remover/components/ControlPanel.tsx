
import React, { useRef, useState, useCallback } from 'react';
import type { ImageDimensions } from '../types';
import { UploadIcon, MagicWandIcon, ClearIcon, ResetIcon, DownloadIcon } from './Icons';

interface ControlPanelProps {
  onImageUpload: (dataUrl: string, dimensions: ImageDimensions) => void;
  onRemoveWatermark: () => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
  hasImage: boolean;
  hasSelection: boolean;
  hasResult: boolean;
  processedImage: string | null;
  onClearSelection: () => void;
  onReset: () => void;
}

const FileUpload: React.FC<{ onUpload: ControlPanelProps['onImageUpload']; disabled: boolean }> = ({ onUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File size should not exceed 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          onUpload(e.target?.result as string, { width: img.width, height: img.height });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) handleFileChange(e.dataTransfer.files);
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
        isDragging 
          ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' 
          : 'border-brand-gray-300 dark:border-brand-gray-600 hover:border-brand-blue'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <UploadIcon className="mx-auto h-10 w-10 text-brand-gray-400" />
      <p className="mt-2 text-sm text-brand-gray-600 dark:text-brand-gray-400">
        <span className="font-semibold text-brand-blue">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-brand-gray-500">PNG, JPG, GIF up to 10MB</p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        onChange={(e) => handleFileChange(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onImageUpload,
  onRemoveWatermark,
  prompt,
  setPrompt,
  isLoading,
  error,
  hasImage,
  hasSelection,
  hasResult,
  processedImage,
  onClearSelection,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-brand-gray-800 rounded-2xl shadow-lg p-6 space-y-6 h-full flex flex-col">
      <div className="flex-grow space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-brand-gray-700 dark:text-brand-gray-200 mb-2">1. Upload Image</h2>
          <FileUpload onUpload={onImageUpload} disabled={isLoading || hasImage}/>
        </div>
        
        {hasImage && !hasResult && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-brand-gray-700 dark:text-brand-gray-200 mb-2">2. Select Watermark</h2>
              <p className="text-sm text-brand-gray-500">Click and drag on the image to select the area you want to remove.</p>
            </div>
            <div>
              <label htmlFor="prompt" className="block text-lg font-semibold text-brand-gray-700 dark:text-brand-gray-200 mb-2">3. (Optional) Add Guidance</label>
              <textarea
                id="prompt"
                rows={3}
                className="w-full p-2 bg-brand-gray-100 dark:bg-brand-gray-700 border border-brand-gray-300 dark:border-brand-gray-600 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
                placeholder="e.g., 'fill with blue sky' or 'match the wood texture'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-brand-gray-200 dark:border-brand-gray-700">
        {hasResult ? (
          <>
            <a
              href={processedImage!}
              download="watermark_removed.png"
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Result
            </a>
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center px-4 py-2 bg-brand-gray-500 text-white font-semibold rounded-lg hover:bg-brand-gray-600 transition-colors duration-200"
            >
              <ResetIcon className="w-5 h-5 mr-2" />
              Start Over
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onRemoveWatermark}
              disabled={!hasSelection || isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-brand-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <MagicWandIcon className="w-5 h-5 mr-2" />
                  Remove Watermark
                </>
              )}
            </button>
            {hasSelection && (
              <button
                onClick={onClearSelection}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-brand-gray-200 dark:bg-brand-gray-700 text-brand-gray-800 dark:text-brand-gray-200 font-semibold rounded-lg hover:bg-brand-gray-300 dark:hover:bg-brand-gray-600 transition-colors"
              >
                <ClearIcon className="w-5 h-5 mr-2" />
                Clear Selection
              </button>
            )}
            {hasImage && (
               <button
                  onClick={onReset}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm text-brand-gray-500 hover:text-brand-gray-700 dark:hover:text-brand-gray-300 transition-colors"
                >
                  <ResetIcon className="w-4 h-4 mr-2" />
                  Reset Image
                </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
