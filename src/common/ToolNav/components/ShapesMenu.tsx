'use client';

import React, { useState } from 'react';
import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../components/store/canvasStore';

interface ShapesMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onShapeSelect?: (shape: any) => void;
}

// ─── Shape Categories ────────────────────────────────────────────────────────
const SHAPE_CATEGORIES = [
  {
    label: 'Basic',
    shapes: [
      { id: 'rectangle',       name: 'Rect',        emoji: '▬' },
      { id: 'square',          name: 'Square',      emoji: '■' },
      { id: 'circle',          name: 'Circle',      emoji: '●' },
      { id: 'ellipse',         name: 'Ellipse',     emoji: '⬭' },
      { id: 'triangle',        name: 'Triangle',    emoji: '▲' },
      { id: 'right-triangle',  name: 'Right Tri',   emoji: '◺' },
      { id: 'diamond',         name: 'Diamond',     emoji: '◆' },
      { id: 'parallelogram',   name: 'Parallel',    emoji: '▱' },
      { id: 'trapezoid',       name: 'Trapezoid',   emoji: '⏢' },
      { id: 'pentagon',        name: 'Pentagon',    emoji: '⬠' },
      { id: 'hexagon',         name: 'Hexagon',     emoji: '⬡' },
      { id: 'heptagon',        name: 'Heptagon',    emoji: '⬡' },
      { id: 'octagon',         name: 'Octagon',     emoji: '⯃' },
      { id: 'cross',           name: 'Cross',       emoji: '✚' },
    ],
  },
  {
    label: 'Stars & Bursts',
    shapes: [
      { id: 'star-3',   name: '3-Star',   emoji: '✦' },
      { id: 'star-4',   name: '4-Star',   emoji: '✦' },
      { id: 'star-5',   name: '5-Star',   emoji: '★' },
      { id: 'star-6',   name: '6-Star',   emoji: '✶' },
      { id: 'star-8',   name: '8-Star',   emoji: '✴' },
      { id: 'star-12',  name: '12-Star',  emoji: '✳' },
      { id: 'burst-4',  name: 'Burst 4',  emoji: '✸' },
      { id: 'burst-8',  name: 'Burst 8',  emoji: '✹' },
      { id: 'starburst',name: 'Starburst',emoji: '⁕' },
    ],
  },
  {
    label: 'Arrows',
    shapes: [
      { id: 'arrow-right',  name: 'Right',    emoji: '➡' },
      { id: 'arrow-left',   name: 'Left',     emoji: '⬅' },
      { id: 'arrow-up',     name: 'Up',       emoji: '⬆' },
      { id: 'arrow-down',   name: 'Down',     emoji: '⬇' },
      { id: 'arrow-double', name: 'Double',   emoji: '↔' },
      { id: 'arrow-chevron',name: 'Chevron',  emoji: '⟩' },
      { id: 'arrow-curved', name: 'Curved',   emoji: '↪' },
    ],
  },
  {
    label: 'Fun',
    shapes: [
      { id: 'heart',        name: 'Heart',    emoji: '♥' },
      { id: 'heart-outline',name: 'Hrt Out',  emoji: '♡' },
      { id: 'cloud',        name: 'Cloud',    emoji: '☁' },
      { id: 'moon',         name: 'Moon',     emoji: '☽' },
      { id: 'sun',          name: 'Sun',      emoji: '☀' },
      { id: 'lightning',    name: 'Lightning',emoji: '⚡' },
      { id: 'speech-bubble',name: 'Speech',   emoji: '💬' },
      { id: 'thought-bubble',name:'Thought',  emoji: '💭' },
      { id: 'flag',         name: 'Flag',     emoji: '⚑' },
      { id: 'badge',        name: 'Badge',    emoji: '🏅' },
    ],
  },
  {
    label: 'Geometric',
    shapes: [
      { id: 'ring',         name: 'Ring',     emoji: '○' },
      { id: 'donut',        name: 'Donut',    emoji: '◎' },
      { id: 'crescent',     name: 'Crescent', emoji: '☾' },
      { id: 'pac-man',      name: 'Pac-Man',  emoji: '◔' },
      { id: 'half-circle',  name: 'Half Cir', emoji: '◗' },
      { id: 'quarter-circle',name:'Quarter',  emoji: '◔' },
      { id: 'rounded-rect', name: 'Rounded',  emoji: '▢' },
      { id: 'pill',         name: 'Pill',     emoji: '⬬' },
    ],
  },
];

export const ShapesMenu: React.FC<ShapesMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onShapeSelect,
}) => {
  const { toolState, updateToolState } = useCanvasStore();
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSelect = (shape: { id: string; name: string }) => {
    updateToolState({ selectedShape: shape.id, activeTool: 'shape' });
    if (onShapeSelect) onShapeSelect(shape);
    onClose();
  };

  return (
    <PortalDropdown isOpen={isOpen} anchorRef={anchorRef} onClose={onClose} width={300}>
      <div className="p-3 space-y-3 font-sans">

        {/* ── Category Tabs ── */}
        <div className="flex gap-1 flex-wrap">
          {SHAPE_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(i)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                activeCategory === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Shape Grid ── */}
        <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {SHAPE_CATEGORIES[activeCategory].shapes.map(shape => (
            <button
              key={shape.id}
              onClick={() => handleSelect(shape)}
              title={shape.name}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-lg transition-all border ${
                toolState.selectedShape === shape.id
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>{shape.emoji}</span>
              <span className="text-[9px] leading-tight text-center">{shape.name}</span>
            </button>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="border-t pt-3 space-y-3">

          {/* Fill Type */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Fill Style</label>
            <div className="flex gap-1.5">
              {(['filled', 'outline', 'filled-outline'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => updateToolState({ shapeFillMode: mode })}
                  className={`flex-1 py-1 px-1 rounded text-xs border transition-colors ${
                    toolState.shapeFillMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {mode === 'filled' ? '■ Fill' : mode === 'outline' ? '□ Outline' : '▣ Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Colors row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium block mb-1">Fill Color</label>
              <input
                type="color"
                value={toolState.shapeFillColor ?? toolState.brushColor}
                onChange={e => updateToolState({ shapeFillColor: e.target.value })}
                className="w-full h-8 rounded border cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium block mb-1">Border Color</label>
              <input
                type="color"
                value={toolState.shapeStrokeColor ?? '#000000'}
                onChange={e => updateToolState({ shapeStrokeColor: e.target.value })}
                className="w-full h-8 rounded border cursor-pointer"
              />
            </div>
          </div>

          {/* Border thickness */}
          <div>
            <label className="text-xs text-gray-500 font-medium flex justify-between mb-1">
              <span>Border Thickness</span>
              <span className="font-bold text-indigo-600">{toolState.shapeStrokeWidth ?? 2}px</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={toolState.shapeStrokeWidth ?? 2}
              onChange={e => updateToolState({ shapeStrokeWidth: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="text-xs text-gray-500 font-medium flex justify-between mb-1">
              <span>Opacity</span>
              <span className="font-bold text-indigo-600">
                {Math.round((toolState.shapeOpacity ?? 1) * 100)}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((toolState.shapeOpacity ?? 1) * 100)}
              onChange={e => updateToolState({ shapeOpacity: Number(e.target.value) / 100 })}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      </div>
    </PortalDropdown>
  );
};