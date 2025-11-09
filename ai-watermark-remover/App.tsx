
import React, { useState, useCallback } from 'react';
import { ImageCanvas } from './components/ImageCanvas';
import { ControlPanel } from './components/ControlPanel';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { SelectionRect, ImageDimensions } from './types';
import { removeWatermark } from './services/geminiService';
import { base64ToBlob } from './utils/imageUtils';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (imageDataUrl: string, dimensions: ImageDimensions) => {
    setOriginalImage(imageDataUrl);
    setImageDimensions(dimensions);
    setProcessedImage(null);
    setSelection(null);
    setError(null);
  };
  
  const handleRemoveWatermark = useCallback(async () => {
    if (!originalImage || !selection) {
      setError('Please upload an image and select a watermark area first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProcessedImage(null);

    // Create mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = imageDimensions.width;
    maskCanvas.height = imageDimensions.height;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) {
      setError('Failed to create image mask.');
      setIsLoading(false);
      return;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, imageDimensions.width, imageDimensions.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    const originalImageBase64 = originalImage.split(',')[1];
    const maskBase64 = maskDataUrl.split(',')[1];
    
    try {
      const resultBase64 = await removeWatermark(originalImageBase64, 'image/png', maskBase64, prompt);
      const resultBlob = base64ToBlob(resultBase64, 'image/png');
      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(resultUrl);
    } catch (err) {
      console.error(err);
      setError('Inpainting failed. The AI model could not process the request. Try a different selection or image.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, selection, prompt, imageDimensions]);

  const resetState = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelection(null);
    setImageDimensions({ width: 0, height: 0 });
    setPrompt('');
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-100 dark:bg-brand-gray-900 text-brand-gray-800 dark:text-brand-gray-200 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <div className="lg:col-span-4 xl:col-span-3">
            <ControlPanel
              onImageUpload={handleImageUpload}
              onRemoveWatermark={handleRemoveWatermark}
              prompt={prompt}
              setPrompt={setPrompt}
              isLoading={isLoading}
              error={error}
              hasImage={!!originalImage}
              hasSelection={!!selection}
              hasResult={!!processedImage}
              processedImage={processedImage}
              onClearSelection={() => setSelection(null)}
              onReset={resetState}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-brand-gray-800 rounded-2xl shadow-lg p-4 flex items-center justify-center min-h-[400px] lg:min-h-0">
            <ImageCanvas 
              originalImage={originalImage}
              processedImage={processedImage}
              selection={selection}
              onSelect={setSelection}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
