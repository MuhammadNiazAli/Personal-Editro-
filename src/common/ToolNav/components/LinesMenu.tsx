'use client';

import React from 'react';
import { Minus, Move, ArrowRight, Circle } from 'lucide-react';
import { PortalDropdown } from '../components/ui/PortalDropdown';

interface LinesMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onLineSelect?: (line: any) => void;
}

const LINES = [
  { id: 'straight', name: 'Straight Line', icon: <Minus size={16} />, draw: true },
  { id: 'dashed', name: 'Dashed Line', icon: <Minus size={16} className="opacity-50" />, draw: true },
  { id: 'curved', name: 'Curved Line', icon: <Move size={16} />, draw: true },
  { id: 'arrow', name: 'Arrow Line', icon: <ArrowRight size={16} />, draw: true },
  { id: 'double', name: 'Double Line', icon: <Minus size={16} />, draw: true },
];

export const LinesMenu: React.FC<LinesMenuProps> = ({ isOpen, anchorRef, onClose, onLineSelect }) => {
  const handleSelect = (line: any) => {
    if (onLineSelect) {
      onLineSelect(line);
    }
    onClose();
  };

  return (
    <PortalDropdown isOpen={isOpen} anchorRef={anchorRef} onClose={onClose} width={200}>
      <div className="py-2">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Line Tools
        </div>
        {LINES.map(line => (
          <button
            key={line.id}
            onClick={() => handleSelect(line)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-6 flex justify-center">{line.icon}</span>
            <span>{line.name}</span>
          </button>
        ))}
      </div>
    </PortalDropdown>
  );
};