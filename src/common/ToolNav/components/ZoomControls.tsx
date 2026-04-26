'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, onFitScreen }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={onZoomOut}
        className="p-1.5 hover:bg-white rounded transition-colors"
        title="Zoom Out (Ctrl -)"
      >
        <ZoomIn size={14} />
      </button>
      <span className="text-xs font-mono min-w-[45px] text-center">
        {Math.round(zoom)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-1.5 hover:bg-white rounded transition-colors"
        title="Zoom In (Ctrl +)"
      >
        <ZoomOut size={14} />
      </button>
      <button
        onClick={onFitScreen}
        className="p-1.5 hover:bg-white rounded transition-colors"
        title="Fit to Screen"
      >
        <Maximize size={14} />
      </button>
    </div>
  );
};