'use client';

import React, { useState } from 'react';
import { Pencil, Pen, Paintbrush, Eraser, Sparkles, Circle, Square, Triangle } from 'lucide-react';
import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../../ToolNav/components/store/canvasStore';

interface BrushMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onBrushSelect?: (brush: any) => void;
}

const BRUSHES = [
  { id: 'pencil', name: 'Pencil', desc: 'Hard edge', icon: <Pencil size={14} />, size: 2 },
  { id: 'pen', name: 'Pen', desc: 'Smooth ink', icon: <Pen size={14} />, size: 4 },
  { id: 'marker', name: 'Marker', desc: 'Thick tip', icon: <Paintbrush size={14} />, size: 8 },
  { id: 'eraser', name: 'Eraser', desc: 'Remove drawing', icon: <Eraser size={14} />, size: 12 },
  { id: 'glow', name: 'Glow', desc: 'Soft effect', icon: <Sparkles size={14} />, size: 6 },
];

const SWATCHES = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];

export const BrushMenu: React.FC<BrushMenuProps> = ({ isOpen, anchorRef, onClose, onBrushSelect }) => {
  const { toolState, updateToolState } = useCanvasStore();
  const [brushSize, setBrushSize] = useState(toolState.brushSize);
  const [brushColor, setBrushColor] = useState(toolState.brushColor);

  const handleBrushSelect = (brush: typeof BRUSHES[0]) => {
    if (brush.id === 'eraser') {
      updateToolState({ activeTool: 'eraser', brushSize: brush.size });
    } else {
      updateToolState({ selectedBrush: brush.id, activeTool: 'brush', brushSize: brush.size });
    }
    onBrushSelect?.(brush);
    onClose();
  };

  const handleSizeChange = (size: number) => {
    setBrushSize(size);
    updateToolState({ brushSize: size });
  };

  return (
    <PortalDropdown isOpen={isOpen} anchorRef={anchorRef} onClose={onClose} width={260}>
      <div className="py-2">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Brush Tools
        </div>
        <div className="grid grid-cols-2 gap-1 p-2">
          {BRUSHES.map(brush => (
            <button
              key={brush.id}
              onClick={() => handleBrushSelect(brush)}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all hover:bg-gray-50 ${
                toolState.selectedBrush === brush.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span>{brush.icon}</span>
              <div className="text-left">
                <div className="font-medium">{brush.name}</div>
                <div className="text-[10px] text-gray-400">{brush.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t my-2" />

        <div className="p-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Brush Size: {brushSize}px</label>
            <input
              type="range"
              min={1}
              max={40}
              value={brushSize}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Color</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => {
                setBrushColor(e.target.value);
                updateToolState({ brushColor: e.target.value });
              }}
              className="w-full h-8 rounded border"
            />
          </div>

          <div>
            <div className="grid grid-cols-5 gap-1">
              {SWATCHES.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setBrushColor(c);
                    updateToolState({ brushColor: c });
                  }}
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalDropdown>
  );
};