'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SubMenuProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const SubMenu: React.FC<SubMenuProps> = ({ label, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let left = rect.right + 4;
      let top = rect.top;
      
      // Check if submenu goes off screen
      const submenuWidth = 220;
      if (left + submenuWidth > window.innerWidth) {
        left = rect.left - submenuWidth - 4;
      }
      
      setPosition({ top, left });
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutId);
  }, []);

  if (!isOpen) {
    return (
      <button
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span>{label}</span>
        </span>
        <ChevronRight size={14} className="text-gray-400" />
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span>{label}</span>
        </span>
        <ChevronRight size={14} className="text-gray-400" />
      </button>

      {createPortal(
        <div
          ref={menuRef}
          onMouseEnter={() => clearTimeout(timeoutId)}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: 220,
            zIndex: 100001,
          }}
          className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-slide-down"
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
};