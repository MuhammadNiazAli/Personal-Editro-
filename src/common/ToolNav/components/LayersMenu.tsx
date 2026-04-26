// components/toolbar/LayersMenu.tsx
'use client';

import React from 'react';
import { Plus, Trash2, Eye, Lock, ArrowUp, ArrowDown, CopyPlus } from 'lucide-react';
import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../components/store/canvasStore';

interface LayersMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onLayerAdd?: () => void;
  onLayerDelete?: () => void;
}

export const LayersMenu: React.FC<LayersMenuProps> = ({ isOpen, anchorRef, onClose, onLayerAdd, onLayerDelete }) => {
  const { layers, activeLayerId, setActiveLayer, toggleLayerVisibility, toggleLayerLock } = useCanvasStore();

  return (
    <PortalDropdown isOpen={isOpen} anchorRef={anchorRef} onClose={onClose} width={260}>
      <div className="max-h-[400px] overflow-y-auto py-2">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Layer Actions
        </div>
        <button
          onClick={() => { onLayerAdd?.(); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Plus size={14} /> Add Layer
        </button>
        <button
          onClick={() => { onLayerDelete?.(); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Trash2 size={14} /> Delete Layer
        </button>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <CopyPlus size={14} /> Duplicate Layer
        </button>

        <div className="border-t my-2" />

        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Layers
        </div>
        {layers.map(layer => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${
              activeLayerId === layer.id ? 'bg-blue-50' : ''
            }`}
          >
            <button
              onClick={() => toggleLayerVisibility(layer.id)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <Eye size={14} className={layer.visible ? 'text-gray-700' : 'text-gray-400'} />
            </button>
            <button
              onClick={() => toggleLayerLock(layer.id)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <Lock size={14} className={layer.locked ? 'text-red-500' : 'text-gray-400'} />
            </button>
            <button
              onClick={() => setActiveLayer(layer.id)}
              className="flex-1 text-left text-sm truncate"
            >
              {layer.name}
            </button>
          </div>
        ))}

        <div className="border-t my-2" />

        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Order
        </div>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <ArrowUp size={14} /> Bring to Front
        </button>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <ArrowDown size={14} /> Send to Back
        </button>
      </div>
    </PortalDropdown>
  );
};