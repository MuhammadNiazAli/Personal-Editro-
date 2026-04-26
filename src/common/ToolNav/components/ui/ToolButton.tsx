// components/ui/ToolButton.tsx
'use client';

import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  active?: boolean;
  shortcut?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  icon, title, onClick, active = false, shortcut,
}) => {
  return (
    <button
      onClick={onClick}
      title={shortcut ? `${title} (${shortcut})` : title}
      className={`relative p-2 rounded-lg transition-all duration-150 hover:bg-gray-100 active:scale-95 ${
        active ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon}
      {shortcut && (
        <span className="absolute -bottom-1 -right-1 text-[9px] font-mono text-gray-400 bg-white px-0.5 rounded">
          {shortcut}
        </span>
      )}
    </button>
  );
};