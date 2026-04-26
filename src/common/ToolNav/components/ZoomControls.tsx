'use client';

import React, { useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronDown,
  Check,
  RotateCcw,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onZoomTo?: (zoom: number) => void;
  onResetZoom?: () => void;
}

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200, 300, 400];

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onZoomTo,
  onResetZoom,
}) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const roundedZoom = Math.round(zoom);

  const handlePreset = (value: number) => {
    onZoomTo?.(value);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
        title="Zoom Out"
      >
        <ZoomOut size={15} />
      </button>

      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-8 min-w-[76px] items-center justify-center gap-1 rounded-lg bg-gray-50 px-2 text-[12px] font-bold text-gray-800 transition hover:bg-gray-100"
        title="Zoom presets"
      >
        <span>{roundedZoom}%</span>
        <ChevronDown
          size={13}
          className={`text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
        title="Zoom In"
      >
        <ZoomIn size={15} />
      </button>

      <div className="mx-0.5 h-5 w-px bg-gray-200" />

      <button
        type="button"
        onClick={onFitScreen}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
        title="Fit to Screen"
      >
        <Maximize size={15} />
      </button>

      {onResetZoom && (
        <button
          type="button"
          onClick={onResetZoom}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          title="Reset Zoom"
        >
          <RotateCcw size={14} />
        </button>
      )}

      <PortalDropdown
        isOpen={isOpen}
        anchorRef={anchorRef}
        onClose={() => setIsOpen(false)}
        width={180}
        align="center"
      >
        <div className="rounded-2xl bg-white p-2">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Zoom
          </div>

          <div className="max-h-[250px] overflow-y-auto rounded-xl bg-gray-50 p-1">
            {ZOOM_PRESETS.map((value) => {
              const selected = roundedZoom === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePreset(value)}
                  disabled={!onZoomTo}
                  className={`mb-1 flex h-8 w-full items-center justify-between rounded-lg px-2 text-[12px] font-semibold transition last:mb-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <span>{value}%</span>
                  {selected && <Check size={13} />}
                </button>
              );
            })}
          </div>

          {!onZoomTo && (
            <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] leading-4 text-amber-700">
              Add onZoomTo prop to use preset zoom values.
            </p>
          )}
        </div>
      </PortalDropdown>
    </div>
  );
};