'use client';

import React, { useMemo, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  MoveHorizontal,
  ChevronDown,
  Check,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../../ToolNav/components/store/canvasStore';

type TextAlign = 'left' | 'center' | 'right';
type DropdownKey = 'font' | 'size' | 'width' | null;

type TextToolExtraState = {
  activeTool?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textStrike?: boolean;
  textAlign?: TextAlign;
  textBoxWidth?: number;
};

interface TextMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onTextAdd?: (font?: string, size?: number) => void;
}

const FONT_CATEGORIES = [
  {
    label: 'Sans-Serif',
    fonts: [
      'Arial',
      'Verdana',
      'Helvetica',
      'Tahoma',
      'Trebuchet MS',
      'Gill Sans',
      'Calibri',
      'Century Gothic',
      'Optima',
      'Futura',
    ],
  },
  {
    label: 'Serif',
    fonts: [
      'Georgia',
      'Times New Roman',
      'Garamond',
      'Palatino',
      'Book Antiqua',
      'Baskerville',
      'Bodoni MT',
      'Cambria',
      'Didot',
      'Rockwell',
    ],
  },
  {
    label: 'Monospace',
    fonts: [
      'Courier New',
      'Lucida Console',
      'Monaco',
      'Consolas',
      'Andale Mono',
      'Menlo',
      'Courier',
      'OCR A Extended',
    ],
  },
  {
    label: 'Display / Fun',
    fonts: [
      'Impact',
      'Comic Sans MS',
      'Papyrus',
      'Copperplate',
      'Snap ITC',
      'Broadway',
      'Brush Script MT',
      'Forte',
      'Harrington',
      'Jokerman',
      'Chiller',
      'Curlz MT',
      'Stencil',
      'Wide Latin',
    ],
  },
  {
    label: 'Handwriting',
    fonts: [
      'Segoe Script',
      'Lucida Handwriting',
      'Bradley Hand ITC',
      'Segoe Print',
      'Freestyle Script',
      'French Script MT',
      'Kunstler Script',
      'Mistral',
      'Monotype Corsiva',
      'Palace Script MT',
    ],
  },
];

const FONT_SIZES = [
  8,
  10,
  12,
  14,
  16,
  18,
  20,
  24,
  28,
  32,
  36,
  42,
  48,
  56,
  64,
  72,
  96,
  120,
];

const TEXT_WIDTHS = [
  140,
  160,
  180,
  200,
  220,
  240,
  260,
  280,
  320,
  360,
  420,
  520,
  640,
];

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

interface CompactNumberDropdownProps {
  value: number;
  items: number[];
  suffix?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: number) => void;
}

const CompactNumberDropdown: React.FC<CompactNumberDropdownProps> = ({
  value,
  items,
  suffix = '',
  isOpen,
  onToggle,
  onSelect,
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-2 text-[12px] font-medium text-gray-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
      >
        <span className="truncate">
          {value}
          {suffix}
        </span>

        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-500 transition ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 max-h-[118px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-inner">
          <div className="grid grid-cols-3 gap-1">
            {items.map((item) => {
              const selected = item === value;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${
                    selected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {item}
                  {suffix}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface FontDropdownProps {
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (font: string) => void;
}

const FontDropdown: React.FC<FontDropdownProps> = ({
  value,
  isOpen,
  onToggle,
  onSelect,
}) => {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-2 text-[12px] font-medium text-gray-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
      >
        <span className="truncate" style={{ fontFamily: value }}>
          {value}
        </span>

        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-500 transition ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 max-h-[150px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-inner">
          {FONT_CATEGORIES.map((category) => (
            <div key={category.label} className="pb-1">
              <div className="sticky top-0 z-10 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {category.label}
              </div>

              <div className="grid grid-cols-1 gap-1">
                {category.fonts.map((fontName) => {
                  const selected = fontName === value;

                  return (
                    <button
                      key={fontName}
                      type="button"
                      onClick={() => onSelect(fontName)}
                      className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] transition ${
                        selected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                      style={{ fontFamily: fontName }}
                    >
                      <span className="truncate">{fontName}</span>

                      {selected && <Check size={13} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TextMenu: React.FC<TextMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onTextAdd,
}) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);

  const { toolState, updateToolState } = useCanvasStore();

  const textState = toolState as typeof toolState & TextToolExtraState;

  const updateTextToolState = (updates: Partial<TextToolExtraState>) => {
    updateToolState(updates as any);
  };

  const font = textState.fontFamily ?? 'Arial';
  const size = textState.fontSize ?? 20;

  const color = textState.textColor ?? '#111827';
  const bold = textState.textBold ?? false;
  const italic = textState.textItalic ?? false;
  const underline = textState.textUnderline ?? false;
  const strike = textState.textStrike ?? false;
  const align = textState.textAlign ?? 'left';

  const textBoxWidth = textState.textBoxWidth ?? 260;

  const allFontCount = useMemo(() => {
    return FONT_CATEGORIES.reduce((sum, category) => {
      return sum + category.fonts.length;
    }, 0);
  }, []);

  const handleDropdownToggle = (key: DropdownKey) => {
    setOpenDropdown((current) => (current === key ? null : key));
  };

  const handleActivate = () => {
    updateTextToolState({
      activeTool: 'text',
      fontFamily: font,
      fontSize: size,
      textColor: color,
      textBold: bold,
      textItalic: italic,
      textUnderline: underline,
      textStrike: strike,
      textAlign: align,
      textBoxWidth,
    });

    onTextAdd?.(font, size);
    onClose();
  };

  const updateBooleanField = (
    field: 'textBold' | 'textItalic' | 'textUnderline' | 'textStrike',
    currentValue: boolean,
  ) => {
    updateTextToolState({
      [field]: !currentValue,
    });
  };

  const decoration = [
    underline ? 'underline' : '',
    strike ? 'line-through' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const previewStyle: React.CSSProperties = {
    width: `${Math.min(textBoxWidth, 250)}px`,
    maxWidth: '100%',
    fontFamily: font,
    fontSize: `${Math.min(size, 22)}px`,
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: decoration || 'none',
    color,
    textAlign: align,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    lineHeight: 1.3,
  };

  return (
    <PortalDropdown
      isOpen={isOpen}
      anchorRef={anchorRef}
      onClose={onClose}
      width={318}
    >
      <div
        className="rounded-2xl bg-white text-sm shadow-xl ring-1 ring-black/5"
        style={{
          maxHeight: 'min(82vh, 500px)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-3 py-2 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Type size={15} />
                </span>

                <span>Text Tool</span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                Text wraps inside selected width.
              </p>
            </div>

            <div
              className="h-7 w-7 shrink-0 rounded-lg border border-gray-200 shadow-sm"
              style={{ backgroundColor: color }}
              title="Selected text color"
            />
          </div>
        </div>

        <div className="space-y-3 p-3">
          <button
            type="button"
            onClick={handleActivate}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Type size={15} />
            Click canvas to add text
          </button>

          <section>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Style
            </label>

            <div className="grid grid-cols-7 gap-1.5">
              {[
                {
                  icon: <Bold size={14} />,
                  field: 'textBold' as const,
                  value: bold,
                  label: 'Bold',
                },
                {
                  icon: <Italic size={14} />,
                  field: 'textItalic' as const,
                  value: italic,
                  label: 'Italic',
                },
                {
                  icon: <Underline size={14} />,
                  field: 'textUnderline' as const,
                  value: underline,
                  label: 'Underline',
                },
                {
                  icon: <Strikethrough size={14} />,
                  field: 'textStrike' as const,
                  value: strike,
                  label: 'Strike',
                },
              ].map((item) => (
                <button
                  key={item.field}
                  type="button"
                  title={item.label}
                  onClick={() => updateBooleanField(item.field, item.value)}
                  className={`flex h-8 items-center justify-center rounded-lg border transition-all ${
                    item.value
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {item.icon}
                </button>
              ))}

              {[
                {
                  icon: <AlignLeft size={14} />,
                  value: 'left' as TextAlign,
                  label: 'Left',
                },
                {
                  icon: <AlignCenter size={14} />,
                  value: 'center' as TextAlign,
                  label: 'Center',
                },
                {
                  icon: <AlignRight size={14} />,
                  value: 'right' as TextAlign,
                  label: 'Right',
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  title={item.label}
                  onClick={() =>
                    updateTextToolState({
                      textAlign: item.value,
                    })
                  }
                  className={`flex h-8 items-center justify-center rounded-lg border transition-all ${
                    align === item.value
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Font Family ({allFontCount}+)
            </label>

            <FontDropdown
              value={font}
              isOpen={openDropdown === 'font'}
              onToggle={() => handleDropdownToggle('font')}
              onSelect={(fontName) => {
                updateTextToolState({
                  fontFamily: fontName,
                });
                setOpenDropdown(null);
              }}
            />
          </section>

          <section className="grid grid-cols-[1fr_74px] gap-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Size
              </label>

              <CompactNumberDropdown
                value={size}
                items={FONT_SIZES}
                suffix="px"
                isOpen={openDropdown === 'size'}
                onToggle={() => handleDropdownToggle('size')}
                onSelect={(fontSize) => {
                  updateTextToolState({
                    fontSize,
                  });
                  setOpenDropdown(null);
                }}
              />

              <input
                type="number"
                value={size}
                min={6}
                max={300}
                onChange={(event) =>
                  updateTextToolState({
                    fontSize: clampNumber(Number(event.target.value), 6, 300),
                  })
                }
                className="mt-1 h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-[12px] text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                <Palette size={11} />
                Color
              </label>

              <input
                type="color"
                value={color}
                onChange={(event) =>
                  updateTextToolState({
                    textColor: event.target.value,
                  })
                }
                className="h-8 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
              />

              <div className="mt-1 rounded-lg bg-gray-50 px-1.5 py-1 text-center text-[10px] font-medium text-gray-500">
                {color}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                <MoveHorizontal size={12} />
                Text Width
              </label>

              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {textBoxWidth}px
              </span>
            </div>

            <input
              type="range"
              min={120}
              max={700}
              step={10}
              value={textBoxWidth}
              onChange={(event) =>
                updateTextToolState({
                  textBoxWidth: Number(event.target.value),
                })
              }
              className="w-full accent-indigo-600"
            />

            <div className="mt-1">
              <CompactNumberDropdown
                value={textBoxWidth}
                items={TEXT_WIDTHS}
                suffix="px"
                isOpen={openDropdown === 'width'}
                onToggle={() => handleDropdownToggle('width')}
                onSelect={(width) => {
                  updateTextToolState({
                    textBoxWidth: width,
                  });
                  setOpenDropdown(null);
                }}
              />
            </div>
          </section>

          <section>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Preview
            </label>

            <div className="max-h-[82px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
              <p style={previewStyle}>
                This is a long preview text. It will wrap to the next line inside the selected width.
              </p>
            </div>
          </section>
        </div>
      </div>
    </PortalDropdown>
  );
};