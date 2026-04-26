'use client';

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface PortalDropdownProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  minWidth?: number;
  offset?: number;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'top' | 'bottom';
};

const VIEWPORT_PADDING = 10;

export const PortalDropdown: React.FC<PortalDropdownProps> = ({
  isOpen,
  anchorRef,
  onClose,
  children,
  width = 260,
  minWidth = 180,
  offset = 8,
  align = 'left',
  className = '',
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);

  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width,
    maxHeight: 420,
    placement: 'bottom',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;

    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const safeWidth = Math.min(
      Math.max(width, minWidth),
      viewportWidth - VIEWPORT_PADDING * 2,
    );

    let left = rect.left;

    if (align === 'right') {
      left = rect.right - safeWidth;
    }

    if (align === 'center') {
      left = rect.left + rect.width / 2 - safeWidth / 2;
    }

    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, viewportWidth - safeWidth - VIEWPORT_PADDING),
    );

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING - offset;
    const spaceAbove = rect.top - VIEWPORT_PADDING - offset;

    const shouldOpenTop = spaceBelow < 260 && spaceAbove > spaceBelow;

    const maxHeight = Math.max(
      180,
      shouldOpenTop ? spaceAbove : spaceBelow,
    );

    const top = shouldOpenTop
      ? Math.max(VIEWPORT_PADDING, rect.top - offset - maxHeight)
      : Math.min(rect.bottom + offset, viewportHeight - VIEWPORT_PADDING);

    setPosition({
      top,
      left,
      width: safeWidth,
      maxHeight,
      placement: shouldOpenTop ? 'top' : 'bottom',
    });
  }, [anchorRef, align, minWidth, offset, width]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const timeoutId = window.setTimeout(updatePosition, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const dropdown = dropdownRef.current;
      const anchor = anchorRef.current;
      const target = event.target as Node;

      if (dropdown?.contains(target)) return;
      if (anchor?.contains(target)) return;

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorRef, isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      data-placement={position.placement}
      className={`fixed z-[9999] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 ${className}`}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxHeight: position.maxHeight,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};