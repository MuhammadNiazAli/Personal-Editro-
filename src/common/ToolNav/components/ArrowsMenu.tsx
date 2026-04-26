'use client';

import React from 'react';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Move } from 'lucide-react';
import { PortalDropdown } from '../components/ui/PortalDropdown';

interface ArrowsMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onArrowSelect?: (arrow: any) => void;
}

const ARROWS = [
  { id: 'right', name: 'Right Arrow', icon: <ArrowRight size={20} /> },
  { id: 'left', name: 'Left Arrow', icon: <ArrowLeft size={20} /> },
  { id: 'up', name: 'Up Arrow', icon: <ArrowUp size={20} /> },
  { id: 'down', name: 'Down Arrow', icon: <ArrowDown size={20} /> },
  { id: 'both', name: 'Both Sides', icon: <Move size={20} /> },
];

export const ArrowsMenu: React.FC<ArrowsMenuProps> = ({ isOpen, anchorRef, onClose, onArrowSelect }) => {
  const handleSelect = (arrow: any) => {
    if (onArrowSelect) onArrowSelect(arrow);
    onClose();
  };

  return (
    <PortalDropdown isOpen={isOpen} anchorRef={anchorRef} onClose={onClose} width={180}>
      <div className="p-2">
        {ARROWS.map(arrow => (
          <button
            key={arrow.id}
            onClick={() => handleSelect(arrow)}
            className="w-full flex items-center gap-3 p-2 text-sm hover:bg-gray-50 rounded transition-colors"
          >
            <span>{arrow.icon}</span>
            <span>{arrow.name}</span>
          </button>
        ))}
      </div>
    </PortalDropdown>
  );
};