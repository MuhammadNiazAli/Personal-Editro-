// components/toolbar/EraserSizes.tsx
'use client';

import React, { useState } from 'react';
import { Eraser } from 'lucide-react';

interface EraserSizesProps {
  onSizeChange?: (size: number) => void;
}

const ERASER_SIZES = [4, 8, 12, 16, 24, 32, 48];

export const EraserSizes: React.FC<EraserSizesProps> = ({ onSizeChange }) => {
  const [selectedSize, setSelectedSize] = useState(12);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 h-8 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Eraser size={16} />
        <span className="text-xs">{selectedSize}px</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg p-2 z-50">
          <div className="space-y-1">
            {ERASER_SIZES.map(size => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  onSizeChange?.(size);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedSize === size ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="bg-gray-600 rounded-full"
                    style={{ width: size, height: size }}
                  />
                  <span>{size}px</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};