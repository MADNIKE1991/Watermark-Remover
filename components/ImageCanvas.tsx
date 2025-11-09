
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { SelectionRect } from '../types';
import { UploadIcon, ZoomInIcon } from './Icons';

interface ImageCanvasProps {
  originalImage: string | null;
  processedImage: string | null;
  selection: SelectionRect | null;
  onSelect: (rect: SelectionRect | null) => void;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({ originalImage, processedImage, selection, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [imageObject, setImageObject] = useState<HTMLImageElement | null>(null);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !imageObject) return;
  
    const imageToDraw = processedImage ? new Image() : imageObject;
    if (processedImage && imageToDraw instanceof HTMLImageElement) {
        imageToDraw.src = processedImage;
        imageToDraw.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageToDraw, 0, 0, canvas.width, canvas.height);
        };
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageToDraw, 0, 0, canvas.width, canvas.height);
    }

    if (selection && !processedImage) {
      ctx.strokeStyle = 'rgba(26, 115, 232, 0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      ctx.fillStyle = 'rgba(26, 115, 232, 0.2)';
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    }
  }, [imageObject, selection, processedImage]);

  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.src = originalImage;
      img.onload = () => {
        setImageObject(img);
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (canvas && container) {
          const containerRatio = container.clientWidth / container.clientHeight;
          const imgRatio = img.width / img.height;
          
          if (containerRatio > imgRatio) {
            canvas.style.height = `${container.clientHeight}px`;
            canvas.style.width = `${container.clientHeight * imgRatio}px`;
          } else {
            canvas.style.width = `${container.clientWidth}px`;
            canvas.style.height = `${container.clientWidth / imgRatio}px`;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          draw();
        }
      };
    }
  }, [originalImage, draw]);

  useEffect(() => {
    draw();
  }, [selection, processedImage, draw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (processedImage) return; // Don't draw on processed image
    setIsDrawing(true);
    const pos = getCanvasCoords(e);
    setStartPos(pos);
    onSelect(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const currentPos = getCanvasCoords(e);
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(startPos.x - currentPos.x);
    const height = Math.abs(startPos.y - currentPos.y);
    onSelect({ x, y, width, height });
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  if (!originalImage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-brand-gray-400 p-4 border-2 border-dashed border-brand-gray-300 dark:border-brand-gray-600 rounded-lg">
        <UploadIcon className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-brand-gray-600 dark:text-brand-gray-300">Image Preview</h3>
        <p className="mt-1">Upload an image to start editing</p>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
        {!processedImage && !selection && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-10 pointer-events-none rounded-lg">
             <ZoomInIcon className="w-12 h-12" />
             <p className="font-semibold text-lg mt-2">Click and drag to select the watermark</p>
          </div>
        )}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop drawing if mouse leaves canvas
        className={`cursor-crosshair rounded-lg ${processedImage ? 'cursor-default' : ''}`}
      />
    </div>
  );
};
