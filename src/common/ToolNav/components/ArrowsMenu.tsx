'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Move,
  Sparkles,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../../ToolNav/components/store/canvasStore';

interface ArrowsMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onArrowSelect?: (arrow: ArrowPreset) => void;
}

type ArrowDirection =
  | 'right'
  | 'left'
  | 'up'
  | 'down'
  | 'up-right'
  | 'up-left'
  | 'down-right'
  | 'down-left'
  | 'both-horizontal'
  | 'both-vertical';

type ArrowPathType =
  | 'straight'
  | 'curved'
  | 'elbow'
  | 'zigzag'
  | 'wave'
  | 'arc'
  | 'loop'
  | 'block'
  | 'chevron'
  | 'split'
  | 'merge'
  | 'circular';

type ArrowHeadType =
  | 'triangle'
  | 'open'
  | 'filled'
  | 'diamond'
  | 'circle'
  | 'bar'
  | 'none';

type ArrowPreset = {
  id: string;
  name: string;
  desc: string;
  direction: ArrowDirection;
  pathType: ArrowPathType;
  headStart: ArrowHeadType;
  headEnd: ArrowHeadType;
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  strokeWidth: number;
  icon: React.ReactNode;
};

type ArrowToolState = {
  activeTool?: string;
  selectedArrow?: string;
  arrowDirection?: ArrowDirection;
  arrowPathType?: ArrowPathType;
  arrowHeadStart?: ArrowHeadType;
  arrowHeadEnd?: ArrowHeadType;
  arrowStrokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  arrowStrokeWidth?: number;
  arrowColor?: string;
};

const ARROWS: ArrowPreset[] = [
  {
    id: 'arrow-right',
    name: 'Right Arrow',
    desc: 'Simple right',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'arrow-left',
    name: 'Left Arrow',
    desc: 'Simple left',
    direction: 'left',
    pathType: 'straight',
    headStart: 'triangle',
    headEnd: 'none',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowLeft size={18} />,
  },
  {
    id: 'arrow-up',
    name: 'Up Arrow',
    desc: 'Simple up',
    direction: 'up',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowUp size={18} />,
  },
  {
    id: 'arrow-down',
    name: 'Down Arrow',
    desc: 'Simple down',
    direction: 'down',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowDown size={18} />,
  },
  {
    id: 'double-horizontal',
    name: 'Double Arrow',
    desc: 'Both sides',
    direction: 'both-horizontal',
    pathType: 'straight',
    headStart: 'triangle',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Move size={18} />,
  },
  {
    id: 'double-vertical',
    name: 'Vertical Double',
    desc: 'Up and down',
    direction: 'both-vertical',
    pathType: 'straight',
    headStart: 'triangle',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Move size={18} />,
  },
  {
    id: 'thin-arrow',
    name: 'Thin Arrow',
    desc: 'Light stroke',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'open',
    strokeStyle: 'solid',
    strokeWidth: 1.5,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'bold-arrow',
    name: 'Bold Arrow',
    desc: 'Heavy stroke',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'filled',
    strokeStyle: 'solid',
    strokeWidth: 6,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'dashed-arrow',
    name: 'Dashed Arrow',
    desc: 'Dashed path',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'dashed',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'dotted-arrow',
    name: 'Dotted Arrow',
    desc: 'Dotted path',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'circle',
    strokeStyle: 'dotted',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'double-line-arrow',
    name: 'Double Line',
    desc: 'Parallel arrow',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'double',
    strokeWidth: 2,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'diamond-head',
    name: 'Diamond Head',
    desc: 'Diamond tip',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'diamond',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'circle-head',
    name: 'Circle Head',
    desc: 'Circle tip',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'circle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'bar-head',
    name: 'Bar Arrow',
    desc: 'End bar',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'bar',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'open-head',
    name: 'Open Head',
    desc: 'Open V tip',
    direction: 'right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'open',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'curved-right',
    name: 'Curved Right',
    desc: 'Soft curve',
    direction: 'right',
    pathType: 'curved',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'curved-left',
    name: 'Curved Left',
    desc: 'Left curve',
    direction: 'left',
    pathType: 'curved',
    headStart: 'triangle',
    headEnd: 'none',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowLeft size={18} />,
  },
  {
    id: 'arc-arrow',
    name: 'Arc Arrow',
    desc: 'Rounded arc',
    direction: 'right',
    pathType: 'arc',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'loop-arrow',
    name: 'Loop Arrow',
    desc: 'Loop style',
    direction: 'right',
    pathType: 'loop',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'elbow-right',
    name: 'Elbow Right',
    desc: 'Corner turn',
    direction: 'right',
    pathType: 'elbow',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'elbow-left',
    name: 'Elbow Left',
    desc: 'Corner left',
    direction: 'left',
    pathType: 'elbow',
    headStart: 'triangle',
    headEnd: 'none',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowLeft size={18} />,
  },
  {
    id: 'zigzag-arrow',
    name: 'Zigzag Arrow',
    desc: 'Sharp turns',
    direction: 'right',
    pathType: 'zigzag',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'wave-arrow',
    name: 'Wave Arrow',
    desc: 'Snake flow',
    direction: 'right',
    pathType: 'wave',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'chevron-arrow',
    name: 'Chevron',
    desc: 'V shape',
    direction: 'right',
    pathType: 'chevron',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 4,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'block-arrow',
    name: 'Block Arrow',
    desc: 'Filled body',
    direction: 'right',
    pathType: 'block',
    headStart: 'none',
    headEnd: 'filled',
    strokeStyle: 'solid',
    strokeWidth: 8,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'up-right-arrow',
    name: 'Up Right',
    desc: 'Diagonal',
    direction: 'up-right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'up-left-arrow',
    name: 'Up Left',
    desc: 'Diagonal',
    direction: 'up-left',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowLeft size={18} />,
  },
  {
    id: 'down-right-arrow',
    name: 'Down Right',
    desc: 'Diagonal',
    direction: 'down-right',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowRight size={18} />,
  },
  {
    id: 'down-left-arrow',
    name: 'Down Left',
    desc: 'Diagonal',
    direction: 'down-left',
    pathType: 'straight',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <ArrowLeft size={18} />,
  },
  {
    id: 'split-arrow',
    name: 'Split Arrow',
    desc: 'One to two',
    direction: 'right',
    pathType: 'split',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'merge-arrow',
    name: 'Merge Arrow',
    desc: 'Two to one',
    direction: 'right',
    pathType: 'merge',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
  {
    id: 'circular-arrow',
    name: 'Circular',
    desc: 'Round flow',
    direction: 'right',
    pathType: 'circular',
    headStart: 'none',
    headEnd: 'triangle',
    strokeStyle: 'solid',
    strokeWidth: 3,
    icon: <Sparkles size={18} />,
  },
];

function ArrowPreview({ arrow }: { arrow: ArrowPreset }) {
  const strokeDasharray =
    arrow.strokeStyle === 'dashed'
      ? '6 4'
      : arrow.strokeStyle === 'dotted'
        ? '1 5'
        : undefined;

  const common = {
    stroke: 'currentColor',
    strokeWidth: arrow.strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    strokeDasharray,
  };

  const drawEndHead = () => {
    if (arrow.headEnd === 'circle') {
      return <circle cx="82" cy="24" r="4" fill="currentColor" />;
    }

    if (arrow.headEnd === 'diamond') {
      return <path d="M82 18 L88 24 L82 30 L76 24 Z" fill="currentColor" />;
    }

    if (arrow.headEnd === 'bar') {
      return <path d="M84 16 L84 32" {...common} />;
    }

    if (arrow.headEnd === 'open') {
      return <path d="M76 17 L84 24 L76 31" {...common} />;
    }

    if (arrow.headEnd === 'triangle' || arrow.headEnd === 'filled') {
      return <path d="M76 16 L88 24 L76 32 Z" fill="currentColor" />;
    }

    return null;
  };

  const drawStartHead = () => {
    if (arrow.headStart === 'circle') {
      return <circle cx="14" cy="24" r="4" fill="currentColor" />;
    }

    if (arrow.headStart === 'diamond') {
      return <path d="M14 18 L20 24 L14 30 L8 24 Z" fill="currentColor" />;
    }

    if (arrow.headStart === 'bar') {
      return <path d="M12 16 L12 32" {...common} />;
    }

    if (arrow.headStart === 'open') {
      return <path d="M20 17 L12 24 L20 31" {...common} />;
    }

    if (arrow.headStart === 'triangle' || arrow.headStart === 'filled') {
      return <path d="M20 16 L8 24 L20 32 Z" fill="currentColor" />;
    }

    return null;
  };

  const renderPath = () => {
    if (arrow.pathType === 'curved') {
      return <path d="M14 32 C34 8, 58 8, 82 24" {...common} />;
    }

    if (arrow.pathType === 'arc') {
      return <path d="M18 34 Q48 4, 82 24" {...common} />;
    }

    if (arrow.pathType === 'loop') {
      return <path d="M14 28 C26 8, 50 8, 44 24 C38 40, 66 42, 82 24" {...common} />;
    }

    if (arrow.pathType === 'elbow') {
      return <path d="M14 34 L42 34 L42 24 L82 24" {...common} />;
    }

    if (arrow.pathType === 'zigzag') {
      return <path d="M14 24 L28 14 L42 34 L56 14 L70 34 L82 24" {...common} />;
    }

    if (arrow.pathType === 'wave') {
      return <path d="M14 24 C24 10, 34 38, 44 24 S64 10, 82 24" {...common} />;
    }

    if (arrow.pathType === 'chevron') {
      return <path d="M16 14 L44 24 L16 34 M46 14 L78 24 L46 34" {...common} />;
    }

    if (arrow.pathType === 'block') {
      return (
        <path
          d="M10 18 H62 V12 L88 24 L62 36 V30 H10 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      );
    }

    if (arrow.pathType === 'split') {
      return (
        <>
          <path d="M12 24 H42" {...common} />
          <path d="M42 24 C54 24, 60 14, 82 14" {...common} />
          <path d="M42 24 C54 24, 60 34, 82 34" {...common} />
          <path d="M76 8 L88 14 L76 20 Z" fill="currentColor" />
          <path d="M76 28 L88 34 L76 40 Z" fill="currentColor" />
        </>
      );
    }

    if (arrow.pathType === 'merge') {
      return (
        <>
          <path d="M12 14 C34 14, 40 24, 52 24" {...common} />
          <path d="M12 34 C34 34, 40 24, 52 24" {...common} />
          <path d="M52 24 H82" {...common} />
        </>
      );
    }

    if (arrow.pathType === 'circular') {
      return <path d="M54 10 A18 18 0 1 0 70 34" {...common} />;
    }

    if (arrow.direction === 'up') {
      return <path d="M48 38 V10" {...common} />;
    }

    if (arrow.direction === 'down') {
      return <path d="M48 10 V38" {...common} />;
    }

    if (arrow.direction === 'up-right') {
      return <path d="M20 36 L76 12" {...common} />;
    }

    if (arrow.direction === 'up-left') {
      return <path d="M76 36 L20 12" {...common} />;
    }

    if (arrow.direction === 'down-right') {
      return <path d="M20 12 L76 36" {...common} />;
    }

    if (arrow.direction === 'down-left') {
      return <path d="M76 12 L20 36" {...common} />;
    }

    if (arrow.direction === 'both-vertical') {
      return <path d="M48 12 V36" {...common} />;
    }

    return <path d="M14 24 H82" {...common} />;
  };

  return (
    <svg viewBox="0 0 96 48" className="h-8 w-full text-current">
      {arrow.strokeStyle === 'double' ? (
        <>
          <path d="M14 19 H82" {...common} />
          <path d="M14 29 H82" {...common} />
        </>
      ) : (
        renderPath()
      )}

      {arrow.direction === 'left' ? drawStartHead() : null}
      {arrow.direction === 'both-horizontal' ? drawStartHead() : null}
      {arrow.direction === 'both-vertical' ? (
        <>
          <path d="M42 18 L48 8 L54 18 Z" fill="currentColor" />
          <path d="M42 30 L48 40 L54 30 Z" fill="currentColor" />
        </>
      ) : null}
      {arrow.direction !== 'left' && arrow.direction !== 'both-vertical'
        ? drawEndHead()
        : null}
    </svg>
  );
}

export const ArrowsMenu: React.FC<ArrowsMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onArrowSelect,
}) => {
  const { toolState, updateToolState } = useCanvasStore();

  const arrowState = toolState as typeof toolState & ArrowToolState;

  const selectedArrow = arrowState.selectedArrow ?? 'arrow-right';

  const selectedArrowData = useMemo(() => {
    return ARROWS.find((arrow) => arrow.id === selectedArrow) ?? ARROWS[0];
  }, [selectedArrow]);

  const handleSelect = (arrow: ArrowPreset) => {
    updateToolState({
      activeTool: 'arrow',
      selectedArrow: arrow.id,
      arrowDirection: arrow.direction,
      arrowPathType: arrow.pathType,
      arrowHeadStart: arrow.headStart,
      arrowHeadEnd: arrow.headEnd,
      arrowStrokeStyle: arrow.strokeStyle,
      arrowStrokeWidth: arrow.strokeWidth,
    } as any);

    onArrowSelect?.(arrow);
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <ArrowRight size={15} />
                </span>

                <span>Arrow Tools</span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {selectedArrowData.name} · {selectedArrowData.desc}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
              {ARROWS.length}+ styles
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="max-h-[390px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {ARROWS.map((arrow) => {
                const isSelected = selectedArrow === arrow.id;

                return (
                  <button
                    key={arrow.id}
                    type="button"
                    onClick={() => handleSelect(arrow)}
                    className={`min-h-[86px] rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                        : 'border-transparent bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <div
                      className={`mb-1 rounded-lg px-1 ${
                        isSelected ? 'bg-white/15' : 'bg-gray-50'
                      }`}
                    >
                      <ArrowPreview arrow={arrow} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {arrow.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-semibold">
                          {arrow.name}
                        </span>

                        <span
                          className={`block truncate text-[10px] ${
                            isSelected ? 'text-indigo-100' : 'text-gray-400'
                          }`}
                        >
                          {arrow.desc}
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