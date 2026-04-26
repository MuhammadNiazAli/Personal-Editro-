'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalDropdownProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  align?: 'left' | 'right';
}

export const PortalDropdown: React.FC<PortalDropdownProps> = ({
  isOpen,
  anchorRef,
  onClose,
  children,
  width = 260,
  align = 'left',
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      let left = align === 'left' ? rect.left : rect.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

      let top = rect.bottom + 6;
      
      // Check if dropdown goes below viewport
      const dropdownHeight = 400; // Approximate height
      if (top + dropdownHeight > window.innerHeight) {
        // Position above the button instead
        top = rect.top - dropdownHeight - 6;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorRef, width, align]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width,
        zIndex: 100000,
      }}
      className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-slide-down"
    >
      {children}
    </div>,
    document.body
  );
};