'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Eraser,
  ChevronDown,
  Check,
  Circle,
} from 'lucide-react';

import { PortalDropdown } from '../ui/PortalDropdown';
import { useCanvasStore } from '../store/canvasStore';

interface EraserSizesProps {
  onSizeChange?: (size: number) => void;
}

type EraserMode = 'soft' | 'hard' | 'pixel';

type EraserPreset = {
  id: string;
  name: string;
  desc: string;
  size: number;
  mode: EraserMode;
};

type EraserToolState = {
  activeTool?: string;
  selectedBrush?: string;
  brushMode?: string;
  brushSize?: number;
  brushOpacity?: number;
  brushComposite?: GlobalCompositeOperation;
  eraserMode?: EraserMode;
};

const ERASER_SIZES = [4, 8, 12, 16, 24, 32, 48, 64, 80];

const ERASER_PRESETS: EraserPreset[] = [
  {
    id: 'hard-small',
    name: 'Small Hard',
    desc: 'Precise remove',
    size: 8,
    mode: 'hard',
  },
  {
    id: 'hard-medium',
    name: 'Medium Hard',
    desc: 'Clean remove',
    size: 16,
    mode: 'hard',
  },
  {
    id: 'hard-large',
    name: 'Large Hard',
    desc: 'Fast remove',
    size: 32,
    mode: 'hard',
  },
  {
    id: 'soft-medium',
    name: 'Soft Eraser',
    desc: 'Gentle edge',
    size: 24,
    mode: 'soft',
  },
  {
    id: 'soft-large',
    name: 'Big Soft',
    desc: 'Large fade',
    size: 48,
    mode: 'soft',
  },
  {
    id: 'pixel',
    name: 'Pixel Eraser',
    desc: 'Block remove',
    size: 16,
    mode: 'pixel',
  },
];

function updateToolStateSafely(updates: Partial<EraserToolState>) {
  const storeApi = useCanvasStore as any;

  if (typeof storeApi.setState === 'function') {
    storeApi.setState((state: any) => ({
      ...state,
      toolState: {
        ...state.toolState,
        ...updates,
      },
    }));
  }
}

export const EraserSizes: React.FC<EraserSizesProps> = ({ onSizeChange }) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const store = useCanvasStore() as any;
  const toolState = (store.toolState ?? {}) as EraserToolState;

  const selectedSize = toolState.brushSize ?? 12;
  const eraserMode = toolState.eraserMode ?? 'hard';

  const selectedPreset = useMemo(() => {
    return (
      ERASER_PRESETS.find(
        (preset) => preset.size === selectedSize && preset.mode === eraserMode,
      ) ?? ERASER_PRESETS[1]
    );
  }, [eraserMode, selectedSize]);

  const applyEraser = (size: number, mode: EraserMode = eraserMode) => {
    const updates: Partial<EraserToolState> = {
      activeTool: 'eraser',
      selectedBrush: 'eraser',
      brushMode: 'eraser',
      brushSize: size,
      brushOpacity: 1,
      brushComposite: 'destination-out',
      eraserMode: mode,
    };

    if (typeof store.updateToolState === 'function') {
      store.updateToolState(updates);
    } else {
      updateToolStateSafely(updates);
    }

    onSizeChange?.(size);
  };

  const handleSizeSelect = (size: number) => {
    applyEraser(size);
    setIsOpen(false);
  };

  const handlePresetSelect = (preset: EraserPreset) => {
    applyEraser(preset.size, preset.mode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-8 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 text-gray-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
        title="Eraser sizes"
      >
        <Eraser size={15} />

        <span className="text-[12px] font-semibold">{selectedSize}px</span>

        <ChevronDown
          size={13}
          className={`text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <PortalDropdown
        isOpen={isOpen}
        anchorRef={anchorRef}
        onClose={() => setIsOpen(false)}
        width={292}
        align="left"
      >
        <div className="rounded-2xl bg-white text-sm">
          <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Eraser size={15} />
                  </span>

                  <span>Eraser</span>
                </div>

                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                  {selectedPreset.name} · {selectedPreset.desc}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {selectedSize}px
              </span>
            </div>
          </div>

          <div className="space-y-3 p-3">
            <section>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Presets
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {ERASER_PRESETS.map((preset) => {
                  const selected =
                    preset.size === selectedSize && preset.mode === eraserMode;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`rounded-xl border p-2 text-left transition ${
                        selected
                          ? 'border-red-500 bg-red-600 text-white shadow-sm'
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <Circle
                          size={Math.min(22, Math.max(10, preset.size / 2))}
                          fill="currentColor"
                        />

                        {selected && <Check size={13} />}
                      </div>

                      <span className="block truncate text-[12px] font-semibold">
                        {preset.name}
                      </span>

                      <span
                        className={`block truncate text-[10px] ${
                          selected ? 'text-red-100' : 'text-gray-400'
                        }`}
                      >
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Custom Size
                </label>

                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  {selectedSize}px
                </span>
              </div>

              <input
                type="range"
                min={4}
                max={100}
                value={selectedSize}
                onChange={(event) => applyEraser(Number(event.target.value))}
                className="w-full accent-red-600"
              />

              <div className="mt-2 max-h-[138px] overflow-y-auto rounded-xl bg-gray-50 p-1">
                <div className="grid grid-cols-3 gap-1">
                  {ERASER_SIZES.map((size) => {
                    const selected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelect(size)}
                        className={`flex h-10 items-center justify-center gap-2 rounded-lg text-[12px] font-semibold transition ${
                          selected
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <span
                          className="rounded-full bg-current"
                          style={{
                            width: Math.min(18, Math.max(5, size / 4)),
                            height: Math.min(18, Math.max(5, size / 4)),
                          }}
                        />
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>
      </PortalDropdown>
    </div>
  );
};