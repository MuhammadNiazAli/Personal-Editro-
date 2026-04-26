'use client';

import React, { useMemo, useState } from 'react';
import {
  Pencil,
  Pen,
  Paintbrush,
  Eraser,
  Sparkles,
  Circle,
  Square,
  Triangle,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../../ToolNav/components/store/canvasStore';

interface BrushMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onBrushSelect?: (brush: BrushPreset) => void;
}

type BrushMode =
  | 'normal'
  | 'pencil'
  | 'pen'
  | 'marker'
  | 'calligraphy'
  | 'spray'
  | 'dotted'
  | 'square'
  | 'glow'
  | 'watercolor'
  | 'crayon'
  | 'chalk'
  | 'charcoal'
  | 'neon'
  | 'ribbon'
  | 'fur'
  | 'sketch'
  | 'ink'
  | 'shadow'
  | 'eraser';

type BrushPreset = {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  size: number;
  opacity: number;
  mode: BrushMode;
  color?: string;
  spacing?: number;
  jitter?: number;
  scatter?: number;
  softness?: number;
  angle?: number;
  pressure?: number;
  glow?: number;
  texture?: boolean;
};

type BrushToolState = {
  activeTool?: string;
  selectedBrush?: string;
  brushMode?: BrushMode;
  brushSize?: number;
  brushColor?: string;
  brushOpacity?: number;
  brushSpacing?: number;
  brushJitter?: number;
  brushScatter?: number;
  brushSoftness?: number;
  brushAngle?: number;
  brushPressure?: number;
  brushGlow?: number;
  brushTexture?: boolean;
  brushComposite?: GlobalCompositeOperation;
};

const BRUSHES: BrushPreset[] = [
  {
    id: 'fine-pencil',
    name: 'Fine Pencil',
    desc: 'Thin rough line',
    icon: <Pencil size={14} />,
    size: 2,
    opacity: 0.75,
    mode: 'pencil',
    jitter: 0.4,
    texture: true,
  },
  {
    id: 'soft-pencil',
    name: 'Soft Pencil',
    desc: 'Light sketch',
    icon: <Pencil size={14} />,
    size: 4,
    opacity: 0.45,
    mode: 'pencil',
    jitter: 0.8,
    texture: true,
  },
  {
    id: 'dark-pencil',
    name: 'Dark Pencil',
    desc: 'Deep graphite',
    icon: <Pencil size={14} />,
    size: 5,
    opacity: 0.9,
    mode: 'pencil',
    jitter: 0.3,
    texture: true,
  },
  {
    id: 'smooth-pen',
    name: 'Smooth Pen',
    desc: 'Clean ink',
    icon: <Pen size={14} />,
    size: 4,
    opacity: 1,
    mode: 'pen',
    pressure: 0.15,
  },
  {
    id: 'gel-pen',
    name: 'Gel Pen',
    desc: 'Rounded ink',
    icon: <Pen size={14} />,
    size: 5,
    opacity: 0.95,
    mode: 'ink',
    pressure: 0.1,
  },
  {
    id: 'technical-pen',
    name: 'Tech Pen',
    desc: 'Sharp line',
    icon: <Pen size={14} />,
    size: 3,
    opacity: 1,
    mode: 'normal',
    pressure: 0,
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    desc: 'Angled stroke',
    icon: <Paintbrush size={14} />,
    size: 10,
    opacity: 0.95,
    mode: 'calligraphy',
    angle: -35,
    pressure: 0.35,
  },
  {
    id: 'flat-brush',
    name: 'Flat Brush',
    desc: 'Wide flat tip',
    icon: <Square size={14} />,
    size: 14,
    opacity: 0.85,
    mode: 'calligraphy',
    angle: 0,
    pressure: 0.25,
  },
  {
    id: 'round-brush',
    name: 'Round Brush',
    desc: 'Smooth paint',
    icon: <Circle size={14} />,
    size: 12,
    opacity: 0.85,
    mode: 'marker',
    softness: 0.2,
  },
  {
    id: 'marker',
    name: 'Marker',
    desc: 'Thick bold',
    icon: <Paintbrush size={14} />,
    size: 16,
    opacity: 0.7,
    mode: 'marker',
    softness: 0.1,
  },
  {
    id: 'highlighter',
    name: 'Highlighter',
    desc: 'Transparent',
    icon: <Paintbrush size={14} />,
    size: 20,
    opacity: 0.35,
    mode: 'marker',
    color: '#facc15',
    softness: 0.2,
  },
  {
    id: 'spray-light',
    name: 'Spray Light',
    desc: 'Soft dots',
    icon: <Sparkles size={14} />,
    size: 18,
    opacity: 0.45,
    mode: 'spray',
    scatter: 12,
    spacing: 3,
  },
  {
    id: 'spray-heavy',
    name: 'Spray Heavy',
    desc: 'Dense spray',
    icon: <Sparkles size={14} />,
    size: 26,
    opacity: 0.65,
    mode: 'spray',
    scatter: 20,
    spacing: 2,
  },
  {
    id: 'dotted',
    name: 'Dotted',
    desc: 'Dot trail',
    icon: <Circle size={14} />,
    size: 8,
    opacity: 1,
    mode: 'dotted',
    spacing: 12,
  },
  {
    id: 'dash-dotted',
    name: 'Dash Dots',
    desc: 'Broken dots',
    icon: <Circle size={14} />,
    size: 7,
    opacity: 0.9,
    mode: 'dotted',
    spacing: 18,
    jitter: 1,
  },
  {
    id: 'square-pixel',
    name: 'Pixel',
    desc: 'Square blocks',
    icon: <Square size={14} />,
    size: 10,
    opacity: 1,
    mode: 'square',
    spacing: 9,
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    desc: 'Block scatter',
    icon: <Square size={14} />,
    size: 14,
    opacity: 0.85,
    mode: 'square',
    spacing: 12,
    jitter: 5,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    desc: 'Soft wash',
    icon: <Paintbrush size={14} />,
    size: 22,
    opacity: 0.28,
    mode: 'watercolor',
    softness: 0.8,
    spacing: 4,
  },
  {
    id: 'wet-brush',
    name: 'Wet Brush',
    desc: 'Blended paint',
    icon: <Paintbrush size={14} />,
    size: 20,
    opacity: 0.38,
    mode: 'watercolor',
    softness: 1,
    jitter: 1.5,
  },
  {
    id: 'crayon',
    name: 'Crayon',
    desc: 'Rough wax',
    icon: <Pencil size={14} />,
    size: 12,
    opacity: 0.65,
    mode: 'crayon',
    jitter: 1.2,
    texture: true,
  },
  {
    id: 'chalk',
    name: 'Chalk',
    desc: 'Dusty edge',
    icon: <Pencil size={14} />,
    size: 14,
    opacity: 0.55,
    mode: 'chalk',
    jitter: 2,
    texture: true,
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    desc: 'Smoky dark',
    icon: <Pencil size={14} />,
    size: 18,
    opacity: 0.5,
    mode: 'charcoal',
    jitter: 2.5,
    softness: 0.7,
    texture: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Bright glow',
    icon: <Sparkles size={14} />,
    size: 9,
    opacity: 1,
    mode: 'neon',
    glow: 16,
  },
  {
    id: 'glow',
    name: 'Glow',
    desc: 'Soft light',
    icon: <Sparkles size={14} />,
    size: 12,
    opacity: 0.85,
    mode: 'glow',
    glow: 22,
  },
  {
    id: 'fire-glow',
    name: 'Fire Glow',
    desc: 'Warm glow',
    icon: <Sparkles size={14} />,
    size: 13,
    opacity: 0.9,
    mode: 'glow',
    color: '#f97316',
    glow: 24,
  },
  {
    id: 'ribbon',
    name: 'Ribbon',
    desc: 'Flow stroke',
    icon: <Triangle size={14} />,
    size: 16,
    opacity: 0.55,
    mode: 'ribbon',
    pressure: 0.7,
  },
  {
    id: 'fur',
    name: 'Fur',
    desc: 'Hairy stroke',
    icon: <Sparkles size={14} />,
    size: 15,
    opacity: 0.65,
    mode: 'fur',
    jitter: 6,
    scatter: 10,
  },
  {
    id: 'sketch',
    name: 'Sketch',
    desc: 'Loose hand',
    icon: <Pencil size={14} />,
    size: 6,
    opacity: 0.5,
    mode: 'sketch',
    jitter: 2.5,
    texture: true,
  },
  {
    id: 'soft-shadow',
    name: 'Shadow',
    desc: 'Soft shade',
    icon: <Circle size={14} />,
    size: 24,
    opacity: 0.22,
    mode: 'shadow',
    softness: 1,
    color: '#111827',
  },
  {
    id: 'eraser',
    name: 'Eraser',
    desc: 'Remove marks',
    icon: <Eraser size={14} />,
    size: 18,
    opacity: 1,
    mode: 'eraser',
  },
];

const SWATCHES = [
  '#000000',
  '#111827',
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#06b6d4',
  '#2563eb',
  '#7c3aed',
  '#ec4899',
  '#ffffff',
  '#9ca3af',
];

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export const BrushMenu: React.FC<BrushMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onBrushSelect,
}) => {
  const { toolState, updateToolState } = useCanvasStore();

  const brushState = toolState as typeof toolState & BrushToolState;

  const [brushSize, setBrushSize] = useState(brushState.brushSize ?? 4);
  const [brushColor, setBrushColor] = useState(brushState.brushColor ?? '#000000');
  const [brushOpacity, setBrushOpacity] = useState(
    Math.round((brushState.brushOpacity ?? 1) * 100),
  );

  const selectedBrush = brushState.selectedBrush ?? 'smooth-pen';

  const selectedBrushData = useMemo(() => {
    return BRUSHES.find((brush) => brush.id === selectedBrush) ?? BRUSHES[3];
  }, [selectedBrush]);

  const updateBrushToolState = (updates: Partial<BrushToolState>) => {
    updateToolState(updates as any);
  };

  const applyBrushToStore = (
    brush: BrushPreset,
    customSize = brush.size,
    customColor = brush.color ?? brushColor,
    customOpacity = brush.opacity,
  ) => {
    const isEraser = brush.mode === 'eraser';

    updateBrushToolState({
      activeTool: isEraser ? 'eraser' : 'brush',
      selectedBrush: brush.id,
      brushMode: brush.mode,
      brushSize: customSize,
      brushColor: customColor,
      brushOpacity: customOpacity,
      brushSpacing: brush.spacing ?? 1,
      brushJitter: brush.jitter ?? 0,
      brushScatter: brush.scatter ?? 0,
      brushSoftness: brush.softness ?? 0,
      brushAngle: brush.angle ?? 0,
      brushPressure: brush.pressure ?? 0,
      brushGlow: brush.glow ?? 0,
      brushTexture: brush.texture ?? false,
      brushComposite: isEraser ? 'destination-out' : 'source-over',
    });
  };

  const handleBrushSelect = (brush: BrushPreset) => {
    const nextColor = brush.color ?? brushColor;
    const nextOpacity = brush.opacity;

    setBrushSize(brush.size);
    setBrushColor(nextColor);
    setBrushOpacity(Math.round(nextOpacity * 100));

    applyBrushToStore(brush, brush.size, nextColor, nextOpacity);

    onBrushSelect?.(brush);
  };

  const handleSizeChange = (size: number) => {
    const safeSize = clampNumber(size, 1, 80);

    setBrushSize(safeSize);

    applyBrushToStore(
      selectedBrushData,
      safeSize,
      brushColor,
      brushOpacity / 100,
    );
  };

  const handleColorChange = (color: string) => {
    setBrushColor(color);

    applyBrushToStore(
      selectedBrushData,
      brushSize,
      color,
      brushOpacity / 100,
    );
  };

  const handleOpacityChange = (opacity: number) => {
    const safeOpacity = clampNumber(opacity, 5, 100);

    setBrushOpacity(safeOpacity);

    applyBrushToStore(
      selectedBrushData,
      brushSize,
      brushColor,
      safeOpacity / 100,
    );
  };

  return (
    <PortalDropdown
      isOpen={isOpen}
      anchorRef={anchorRef}
      onClose={onClose}
      width={326}
    >
      <div
        className="rounded-2xl bg-white text-sm shadow-xl ring-1 ring-black/5"
        style={{
          maxHeight: 'min(82vh, 520px)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-3 py-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Paintbrush size={15} />
                </span>

                <span>Brush Studio</span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {selectedBrushData.name} · {selectedBrushData.desc}
              </p>
            </div>

            <div
              className="h-7 w-7 shrink-0 rounded-lg border border-gray-200 shadow-sm"
              style={{ backgroundColor: brushColor }}
              title="Selected brush color"
            />
          </div>
        </div>

        <div className="space-y-3 p-3">
          <section>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Brushes
              </label>

              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {BRUSHES.length}+ tools
              </span>
            </div>

            <div className="max-h-[218px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                {BRUSHES.map((brush) => {
                  const isSelected = selectedBrush === brush.id;

                  return (
                    <button
                      key={brush.id}
                      type="button"
                      onClick={() => handleBrushSelect(brush)}
                      className={`flex min-h-[52px] items-center gap-2 rounded-xl border px-2 py-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                          : 'border-transparent bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {brush.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-semibold">
                          {brush.name}
                        </span>

                        <span
                          className={`block truncate text-[10px] ${
                            isSelected ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {brush.desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Brush Size
              </label>

              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {brushSize}px
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={80}
              value={brushSize}
              onChange={(event) => handleSizeChange(Number(event.target.value))}
              className="w-full accent-blue-600"
            />

            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-9 flex-1 items-center justify-center rounded-lg bg-gray-50">
                <div
                  className="rounded-full bg-gray-900"
                  style={{
                    width: clampNumber(brushSize, 2, 36),
                    height: clampNumber(brushSize, 2, 36),
                    opacity: brushOpacity / 100,
                  }}
                />
              </div>

              <input
                type="number"
                min={1}
                max={80}
                value={brushSize}
                onChange={(event) => handleSizeChange(Number(event.target.value))}
                className="h-9 w-16 rounded-lg border border-gray-200 px-2 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Opacity
              </label>

              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {brushOpacity}%
              </span>
            </div>

            <input
              type="range"
              min={5}
              max={100}
              value={brushOpacity}
              onChange={(event) =>
                handleOpacityChange(Number(event.target.value))
              }
              className="w-full accent-blue-600"
            />
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Color
              </label>

              <span className="text-[10px] font-semibold text-gray-500">
                {brushColor}
              </span>
            </div>

            <input
              type="color"
              value={brushColor}
              onChange={(event) => handleColorChange(event.target.value)}
              className="h-9 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
            />

            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {SWATCHES.map((color) => {
                const isSelected = brushColor.toLowerCase() === color.toLowerCase();

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`h-7 rounded-lg border transition-all ${
                      isSelected
                        ? 'scale-105 border-blue-600 ring-2 ring-blue-100'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Current Brush
              </label>

              <span className="text-[10px] font-semibold text-blue-600">
                {selectedBrushData.mode}
              </span>
            </div>

            <div className="rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {selectedBrushData.icon}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[12px] font-bold text-gray-900">
                    {selectedBrushData.name}
                  </p>

                  <p className="truncate text-[11px] text-gray-500">
                    Size {brushSize}px · Opacity {brushOpacity}%
                  </p>
                </div>
              </div>

              <div className="mt-2 h-8 overflow-hidden rounded-lg bg-gray-50 px-2">
                <svg width="100%" height="32" viewBox="0 0 240 32">
                  <path
                    d="M6 20 C 42 4, 78 30, 112 16 S 180 8, 234 18"
                    fill="none"
                    stroke={brushColor}
                    strokeWidth={Math.min(Math.max(brushSize / 2, 2), 16)}
                    strokeLinecap={
                      selectedBrushData.mode === 'square' ? 'butt' : 'round'
                    }
                    strokeLinejoin="round"
                    opacity={brushOpacity / 100}
                    filter={
                      selectedBrushData.glow
                        ? 'drop-shadow(0 0 5px currentColor)'
                        : undefined
                    }
                  />
                </svg>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PortalDropdown>
  );
};