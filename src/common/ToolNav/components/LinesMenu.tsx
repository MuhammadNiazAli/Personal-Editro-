'use client';

import React, { useMemo } from 'react';
import {
  Minus,
  Move,
  ArrowRight,
  Circle,
  Waves,
  Zap,
  Sparkles,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../../ToolNav/components/store/canvasStore';

interface LinesMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onLineSelect?: (line: LinePreset) => void;
}

type LinePathType =
  | 'straight'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'thin'
  | 'bold'
  | 'curved'
  | 'arc'
  | 'wave'
  | 'zigzag'
  | 'snake'
  | 'loop'
  | 'spring'
  | 'step'
  | 'elbow'
  | 'brace'
  | 'bracket'
  | 'capsule'
  | 'rail'
  | 'lightning'
  | 'sketch'
  | 'hairline'
  | 'rough'
  | 'center-dot'
  | 'round-head'
  | 'square-head';

type LineCapType = 'butt' | 'round' | 'square';

type LinePreset = {
  id: string;
  name: string;
  desc: string;
  pathType: LinePathType;
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  strokeWidth: number;
  lineCap: LineCapType;
  dash?: number[];
  icon: React.ReactNode;
};

type LineToolState = {
  activeTool?: string;
  selectedLine?: string;
  linePathType?: LinePathType;
  lineStrokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  lineStrokeWidth?: number;
  lineCap?: LineCapType;
  lineDash?: number[];
  lineColor?: string;
};

const LINES: LinePreset[] = [
  {
    id: 'straight',
    name: 'Straight',
    desc: 'Clean line',
    pathType: 'straight',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'butt',
    icon: <Minus size={16} />,
  },
  {
    id: 'thin',
    name: 'Thin',
    desc: 'Fine stroke',
    pathType: 'thin',
    strokeStyle: 'solid',
    strokeWidth: 1.5,
    lineCap: 'round',
    icon: <Minus size={16} />,
  },
  {
    id: 'bold',
    name: 'Bold',
    desc: 'Heavy stroke',
    pathType: 'bold',
    strokeStyle: 'solid',
    strokeWidth: 7,
    lineCap: 'round',
    icon: <Minus size={16} />,
  },
  {
    id: 'hairline',
    name: 'Hairline',
    desc: 'Very slim',
    pathType: 'hairline',
    strokeStyle: 'solid',
    strokeWidth: 1,
    lineCap: 'butt',
    icon: <Minus size={16} />,
  },
  {
    id: 'round-head',
    name: 'Round Head',
    desc: 'Soft ends',
    pathType: 'round-head',
    strokeStyle: 'solid',
    strokeWidth: 5,
    lineCap: 'round',
    icon: <Circle size={16} />,
  },
  {
    id: 'square-head',
    name: 'Square Head',
    desc: 'Flat ends',
    pathType: 'square-head',
    strokeStyle: 'solid',
    strokeWidth: 5,
    lineCap: 'square',
    icon: <Minus size={16} />,
  },
  {
    id: 'dashed',
    name: 'Dashed',
    desc: 'Short dashes',
    pathType: 'dashed',
    strokeStyle: 'dashed',
    strokeWidth: 3,
    lineCap: 'butt',
    dash: [10, 7],
    icon: <Minus size={16} className="opacity-60" />,
  },
  {
    id: 'long-dashed',
    name: 'Long Dash',
    desc: 'Long gaps',
    pathType: 'dashed',
    strokeStyle: 'dashed',
    strokeWidth: 3,
    lineCap: 'butt',
    dash: [18, 9],
    icon: <Minus size={16} />,
  },
  {
    id: 'tiny-dashed',
    name: 'Tiny Dash',
    desc: 'Small cuts',
    pathType: 'dashed',
    strokeStyle: 'dashed',
    strokeWidth: 3,
    lineCap: 'butt',
    dash: [5, 5],
    icon: <Minus size={16} />,
  },
  {
    id: 'dotted',
    name: 'Dotted',
    desc: 'Dot path',
    pathType: 'dotted',
    strokeStyle: 'dotted',
    strokeWidth: 4,
    lineCap: 'round',
    dash: [1, 8],
    icon: <Circle size={16} />,
  },
  {
    id: 'dense-dotted',
    name: 'Dense Dots',
    desc: 'Close dots',
    pathType: 'dotted',
    strokeStyle: 'dotted',
    strokeWidth: 4,
    lineCap: 'round',
    dash: [1, 5],
    icon: <Circle size={16} />,
  },
  {
    id: 'dash-dot',
    name: 'Dash Dot',
    desc: 'Mixed path',
    pathType: 'dashed',
    strokeStyle: 'dashed',
    strokeWidth: 3,
    lineCap: 'round',
    dash: [12, 5, 2, 5],
    icon: <Sparkles size={16} />,
  },
  {
    id: 'double',
    name: 'Double',
    desc: 'Two lines',
    pathType: 'double',
    strokeStyle: 'double',
    strokeWidth: 2,
    lineCap: 'round',
    icon: <Minus size={16} />,
  },
  {
    id: 'rail',
    name: 'Rail Line',
    desc: 'Track style',
    pathType: 'rail',
    strokeStyle: 'double',
    strokeWidth: 2,
    lineCap: 'butt',
    icon: <Minus size={16} />,
  },
  {
    id: 'curved',
    name: 'Curved',
    desc: 'Smooth curve',
    pathType: 'curved',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Move size={16} />,
  },
  {
    id: 'arc',
    name: 'Arc',
    desc: 'Round bend',
    pathType: 'arc',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Move size={16} />,
  },
  {
    id: 'wave',
    name: 'Wave',
    desc: 'Soft wave',
    pathType: 'wave',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Waves size={16} />,
  },
  {
    id: 'snake',
    name: 'Snake',
    desc: 'Long wave',
    pathType: 'snake',
    strokeStyle: 'solid',
    strokeWidth: 4,
    lineCap: 'round',
    icon: <Waves size={16} />,
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    desc: 'Sharp turns',
    pathType: 'zigzag',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Zap size={16} />,
  },
  {
    id: 'sharp-zigzag',
    name: 'Sharp Zigzag',
    desc: 'Hard corners',
    pathType: 'zigzag',
    strokeStyle: 'solid',
    strokeWidth: 4,
    lineCap: 'butt',
    icon: <Zap size={16} />,
  },
  {
    id: 'lightning',
    name: 'Lightning',
    desc: 'Electric shape',
    pathType: 'lightning',
    strokeStyle: 'solid',
    strokeWidth: 4,
    lineCap: 'round',
    icon: <Zap size={16} />,
  },
  {
    id: 'spring',
    name: 'Spring',
    desc: 'Coil line',
    pathType: 'spring',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Sparkles size={16} />,
  },
  {
    id: 'loop',
    name: 'Loop',
    desc: 'Loop curve',
    pathType: 'loop',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Sparkles size={16} />,
  },
  {
    id: 'step',
    name: 'Step',
    desc: 'Stair line',
    pathType: 'step',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'butt',
    icon: <Move size={16} />,
  },
  {
    id: 'elbow',
    name: 'Elbow',
    desc: 'Corner line',
    pathType: 'elbow',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Move size={16} />,
  },
  {
    id: 'brace',
    name: 'Brace',
    desc: 'Curly brace',
    pathType: 'brace',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Sparkles size={16} />,
  },
  {
    id: 'bracket',
    name: 'Bracket',
    desc: 'Bracket shape',
    pathType: 'bracket',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'butt',
    icon: <Sparkles size={16} />,
  },
  {
    id: 'capsule',
    name: 'Capsule',
    desc: 'Rounded body',
    pathType: 'capsule',
    strokeStyle: 'solid',
    strokeWidth: 8,
    lineCap: 'round',
    icon: <Minus size={16} />,
  },
  {
    id: 'center-dot',
    name: 'Center Dot',
    desc: 'Line with dot',
    pathType: 'center-dot',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <Circle size={16} />,
  },
  {
    id: 'rough',
    name: 'Rough',
    desc: 'Hand drawn',
    pathType: 'rough',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <PencilIcon />,
  },
  {
    id: 'sketch',
    name: 'Sketch',
    desc: 'Loose line',
    pathType: 'sketch',
    strokeStyle: 'solid',
    strokeWidth: 2,
    lineCap: 'round',
    icon: <PencilIcon />,
  },
  {
    id: 'arrow-line',
    name: 'Arrow Line',
    desc: 'Line arrow',
    pathType: 'straight',
    strokeStyle: 'solid',
    strokeWidth: 3,
    lineCap: 'round',
    icon: <ArrowRight size={16} />,
  },
];

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M4 17.5V20h2.5L18.8 7.7l-2.5-2.5L4 17.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 6l2.5 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinePreview({ line }: { line: LinePreset }) {
  const dash =
    line.dash?.join(' ') ??
    (line.strokeStyle === 'dashed'
      ? '10 7'
      : line.strokeStyle === 'dotted'
        ? '1 8'
        : undefined);

  const common = {
    stroke: 'currentColor',
    strokeWidth: line.strokeWidth,
    strokeLinecap: line.lineCap,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    strokeDasharray: dash,
  };

  const renderPath = () => {
    if (line.pathType === 'double') {
      return (
        <>
          <path d="M10 19 H86" {...common} />
          <path d="M10 29 H86" {...common} />
        </>
      );
    }

    if (line.pathType === 'rail') {
      return (
        <>
          <path d="M10 18 H86" {...common} />
          <path d="M10 30 H86" {...common} />
          <path d="M20 16 V32 M34 16 V32 M48 16 V32 M62 16 V32 M76 16 V32" {...common} strokeWidth={1.5} />
        </>
      );
    }

    if (line.pathType === 'curved') {
      return <path d="M10 34 C30 8, 62 8, 86 26" {...common} />;
    }

    if (line.pathType === 'arc') {
      return <path d="M14 36 Q48 4, 84 36" {...common} />;
    }

    if (line.pathType === 'wave') {
      return <path d="M10 24 C20 10, 30 38, 40 24 S60 10, 86 24" {...common} />;
    }

    if (line.pathType === 'snake') {
      return <path d="M10 24 C18 6, 28 42, 38 24 S58 6, 68 24 S80 42, 88 24" {...common} />;
    }

    if (line.pathType === 'zigzag') {
      return <path d="M10 24 L22 12 L34 36 L46 12 L58 36 L70 12 L86 24" {...common} />;
    }

    if (line.pathType === 'lightning') {
      return <path d="M12 10 L38 10 L28 24 L52 24 L42 38 L84 16" {...common} />;
    }

    if (line.pathType === 'spring') {
      return <path d="M10 24 C14 12, 22 12, 26 24 S38 36, 42 24 S54 12, 58 24 S70 36, 74 24 S84 12, 88 24" {...common} />;
    }

    if (line.pathType === 'loop') {
      return <path d="M10 28 C24 8, 48 8, 42 24 C36 40, 66 42, 86 22" {...common} />;
    }

    if (line.pathType === 'step') {
      return <path d="M10 34 H28 V26 H46 V18 H64 V10 H86" {...common} />;
    }

    if (line.pathType === 'elbow') {
      return <path d="M10 34 H44 V16 H86" {...common} />;
    }

    if (line.pathType === 'brace') {
      return <path d="M72 8 C56 8, 66 22, 48 24 C66 26, 56 40, 72 40" {...common} />;
    }

    if (line.pathType === 'bracket') {
      return <path d="M68 8 H50 V40 H68" {...common} />;
    }

    if (line.pathType === 'capsule') {
      return <path d="M14 24 H82" {...common} />;
    }

    if (line.pathType === 'center-dot') {
      return (
        <>
          <path d="M10 24 H86" {...common} />
          <circle cx="48" cy="24" r="5" fill="currentColor" />
        </>
      );
    }

    if (line.pathType === 'rough') {
      return (
        <>
          <path d="M10 23 L20 25 L32 22 L44 26 L56 21 L68 25 L86 23" {...common} opacity="0.9" />
          <path d="M10 26 L22 23 L34 27 L46 23 L58 26 L70 22 L86 26" {...common} opacity="0.45" />
        </>
      );
    }

    if (line.pathType === 'sketch') {
      return (
        <>
          <path d="M10 22 C34 18, 56 30, 86 22" {...common} opacity="0.7" />
          <path d="M10 26 C34 20, 56 34, 86 25" {...common} opacity="0.35" />
        </>
      );
    }

    return <path d="M10 24 H86" {...common} />;
  };

  return (
    <svg viewBox="0 0 96 48" className="h-8 w-full text-current">
      {renderPath()}
    </svg>
  );
}

export const LinesMenu: React.FC<LinesMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onLineSelect,
}) => {
  const { toolState, updateToolState } = useCanvasStore();

  const lineState = toolState as typeof toolState & LineToolState;

  const selectedLine = lineState.selectedLine ?? 'straight';

  const selectedLineData = useMemo(() => {
    return LINES.find((line) => line.id === selectedLine) ?? LINES[0];
  }, [selectedLine]);

  const handleSelect = (line: LinePreset) => {
    updateToolState({
      activeTool: 'line',
      selectedLine: line.id,
      linePathType: line.pathType,
      lineStrokeStyle: line.strokeStyle,
      lineStrokeWidth: line.strokeWidth,
      lineCap: line.lineCap,
      lineDash: line.dash ?? [],
    } as any);

    onLineSelect?.(line);
    onClose();
  };

  return (
    <PortalDropdown
      isOpen={isOpen}
      anchorRef={anchorRef}
      onClose={onClose}
      width={336}
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
                  <Minus size={15} />
                </span>

                <span>Line Tools</span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {selectedLineData.name} · {selectedLineData.desc}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
              {LINES.length}+ styles
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="max-h-[390px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {LINES.map((line) => {
                const isSelected = selectedLine === line.id;

                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => handleSelect(line)}
                    className={`min-h-[86px] rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                        : 'border-transparent bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div
                      className={`mb-1 rounded-lg px-1 ${
                        isSelected ? 'bg-white/15' : 'bg-gray-50'
                      }`}
                    >
                      <LinePreview line={line} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {line.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-semibold">
                          {line.name}
                        </span>

                        <span
                          className={`block truncate text-[10px] ${
                            isSelected ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {line.desc}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PortalDropdown>
  );
};