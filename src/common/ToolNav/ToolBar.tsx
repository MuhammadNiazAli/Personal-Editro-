'use client';

import React, { useRef, useState } from 'react';
import {
  Settings,
  Brush,
  Type,
  Shapes,
  Eraser,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Layers,
  Grid,
  Ruler,
  ArrowRight,
  Minus,
  Hand,
  Eye,
  ChevronDown,
} from 'lucide-react';

import { FileMenu } from './components/FileMenu';
import { BrushMenu } from './components/BrushMenu';
import { TextMenu } from './components/TextMenu';
import { ShapesMenu } from './components/ShapesMenu';
import { ArrowsMenu } from './components/ArrowsMenu';
import { LinesMenu } from './components/LinesMenu';
import { LayersMenu } from './components/LayersMenu';
import { ZoomControls } from './components/ZoomControls';
import { EraserSizes } from './components/toolbar/EraserSizes';
import { useCanvasStore } from './components/store/canvasStore';

interface ToolbarProps {
  onImport?: (file: File) => void;
  onExport?: (format: string) => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;

  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomTo?: (zoom: number) => void;
  onResetZoom?: () => void;
  onFitScreen?: () => void;

  onTextAdd?: (font?: string, size?: number) => void;
  onShapeSelect?: (shape: any) => void;
  onArrowSelect?: (arrow: any) => void;
  onLineSelect?: (line: any) => void;
  onBrushSelect?: (brush: any) => void;

  onLayerAdd?: () => void;
  onLayerDelete?: () => void;
  onGridToggle?: () => void;
  onRulerToggle?: () => void;
  onEraserToggle?: () => void;
  onMoveToggle?: () => void;
}

type ToolName =
  | 'brush'
  | 'text'
  | 'shape'
  | 'arrow'
  | 'line'
  | 'hand'
  | 'eraser'
  | 'eyedropper'
  | 'icon';

export const Toolbar: React.FC<ToolbarProps> = ({
  onImport,
  onExport,
  onSave,
  onUndo,
  onRedo,
  onCopy,
  onDelete,

  onZoomIn,
  onZoomOut,
  onZoomTo,
  onResetZoom,
  onFitScreen,

  onTextAdd,
  onShapeSelect,
  onArrowSelect,
  onLineSelect,
  onBrushSelect,

  onLayerAdd,
  onLayerDelete,
  onGridToggle,
  onRulerToggle,
  onEraserToggle,
  onMoveToggle,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fileBtnRef = useRef<HTMLButtonElement | null>(null);
  const brushBtnRef = useRef<HTMLButtonElement | null>(null);
  const textBtnRef = useRef<HTMLButtonElement | null>(null);
  const shapesBtnRef = useRef<HTMLButtonElement | null>(null);
  const arrowsBtnRef = useRef<HTMLButtonElement | null>(null);
  const linesBtnRef = useRef<HTMLButtonElement | null>(null);
  const layersBtnRef = useRef<HTMLButtonElement | null>(null);

  const { toolState, updateToolState, setZoom } = useCanvasStore();

  const closeMenu = () => {
    setOpenMenu(null);
  };

  const toggleMenu = (menu: string) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const applyZoom = (zoom: number) => {
    const safeZoom = Math.min(Math.max(zoom, 10), 500);

    if (onZoomTo) {
      onZoomTo(safeZoom);
      return;
    }

    setZoom(safeZoom);
  };

  const handleZoomIn = () => {
    if (onZoomIn) {
      onZoomIn();
      return;
    }

    applyZoom((toolState.zoom ?? 100) + 10);
  };

  const handleZoomOut = () => {
    if (onZoomOut) {
      onZoomOut();
      return;
    }

    applyZoom((toolState.zoom ?? 100) - 10);
  };

  const handleZoomTo = (zoom: number) => {
    applyZoom(zoom);
  };

  const handleResetZoom = () => {
    if (onResetZoom) {
      onResetZoom();
      return;
    }

    applyZoom(100);
  };

  const handleFitScreen = () => {
    if (onFitScreen) {
      onFitScreen();
      return;
    }

    applyZoom(100);
  };

  const isToolActive = (tool: ToolName) => {
    return toolState.activeTool === tool;
  };

  const activateTool = (tool: ToolName, callback?: () => void) => {
    const nextTool = toolState.activeTool === tool ? null : tool;

    updateToolState({
      activeTool: nextTool,
    });

    if (nextTool === tool) {
      callback?.();
    }
  };

  const toolButtonClass = (tool: ToolName) => {
    return `p-2 rounded-lg hover:bg-gray-100 transition-colors ${
      isToolActive(tool)
        ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
        : 'text-gray-700'
    }`;
  };

  const menuButtonClass = (active: boolean) => {
    return `p-2 rounded-lg hover:bg-gray-100 transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
        : 'text-gray-700'
    }`;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.15s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="flex h-12 items-center gap-0.5 overflow-x-auto px-2 scrollbar-hide">
          <button
            ref={fileBtnRef}
            type="button"
            onClick={() => toggleMenu('file')}
            className={`flex h-8 items-center gap-1 rounded-lg px-2 transition-colors hover:bg-gray-100 ${
              openMenu === 'file'
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-700'
            }`}
            title="File"
          >
            <Settings size={16} />
            <ChevronDown
              size={12}
              className={`transition ${openMenu === 'file' ? 'rotate-180' : ''}`}
            />
          </button>

          <FileMenu
            isOpen={openMenu === 'file'}
            anchorRef={fileBtnRef}
            onClose={closeMenu}
            onImport={onImport}
            onExport={onExport}
            onSave={onSave}
          />

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <button
            type="button"
            onClick={onUndo}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Undo"
          >
            <Undo2 size={16} />
          </button>

          <button
            type="button"
            onClick={onRedo}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Redo"
          >
            <Redo2 size={16} />
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Copy"
          >
            <Copy size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <button
            ref={brushBtnRef}
            type="button"
            onClick={() => toggleMenu('brush')}
            className={menuButtonClass(
              openMenu === 'brush' || isToolActive('brush'),
            )}
            title="Brush Tool"
          >
            <Brush size={16} />
          </button>

          <BrushMenu
            isOpen={openMenu === 'brush'}
            anchorRef={brushBtnRef}
            onClose={closeMenu}
            onBrushSelect={(brush) => {
              onBrushSelect?.(brush);
              closeMenu();
            }}
          />

          <button
            ref={textBtnRef}
            type="button"
            onClick={() => toggleMenu('text')}
            className={menuButtonClass(
              openMenu === 'text' || isToolActive('text'),
            )}
            title="Text Tool"
          >
            <Type size={16} />
          </button>

          <TextMenu
            isOpen={openMenu === 'text'}
            anchorRef={textBtnRef}
            onClose={closeMenu}
            onTextAdd={(font, size) => {
              onTextAdd?.(font, size);
              closeMenu();
            }}
          />

          <button
            ref={shapesBtnRef}
            type="button"
            onClick={() => toggleMenu('shapes')}
            className={menuButtonClass(
              openMenu === 'shapes' || isToolActive('shape'),
            )}
            title="Shapes"
          >
            <Shapes size={16} />
          </button>

          <ShapesMenu
            isOpen={openMenu === 'shapes'}
            anchorRef={shapesBtnRef}
            onClose={closeMenu}
            onShapeSelect={(shape) => {
              onShapeSelect?.(shape);
              closeMenu();
            }}
          />

          <button
            ref={arrowsBtnRef}
            type="button"
            onClick={() => toggleMenu('arrows')}
            className={menuButtonClass(
              openMenu === 'arrows' || isToolActive('arrow'),
            )}
            title="Arrows"
          >
            <ArrowRight size={16} />
          </button>

          <ArrowsMenu
            isOpen={openMenu === 'arrows'}
            anchorRef={arrowsBtnRef}
            onClose={closeMenu}
            onArrowSelect={(arrow) => {
              onArrowSelect?.(arrow);
              closeMenu();
            }}
          />

          <button
            ref={linesBtnRef}
            type="button"
            onClick={() => toggleMenu('lines')}
            className={menuButtonClass(
              openMenu === 'lines' || isToolActive('line'),
            )}
            title="Lines"
          >
            <Minus size={16} />
          </button>

          <LinesMenu
            isOpen={openMenu === 'lines'}
            anchorRef={linesBtnRef}
            onClose={closeMenu}
            onLineSelect={(line) => {
              onLineSelect?.(line);
              closeMenu();
            }}
          />

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => activateTool('hand', onMoveToggle)}
            className={toolButtonClass('hand')}
            title="Hand Tool"
          >
            <Hand size={16} />
          </button>

          <button
            type="button"
            onClick={() => activateTool('eraser', onEraserToggle)}
            className={toolButtonClass('eraser')}
            title="Eraser Tool"
          >
            <Eraser size={16} />
          </button>

          {isToolActive('eraser') && (
            <EraserSizes
              onSizeChange={(size) => {
                updateToolState({
                  activeTool: 'eraser',
                  selectedBrush: 'eraser',
                  brushMode: 'eraser',
                  brushSize: size,
                  brushOpacity: 1,
                  brushComposite: 'destination-out',
                });
              }}
            />
          )}

          <button
            type="button"
            onClick={() => activateTool('eyedropper')}
            className={toolButtonClass('eyedropper')}
            title="Eye Dropper"
          >
            <Eye size={16} />
          </button>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <button
            ref={layersBtnRef}
            type="button"
            onClick={() => toggleMenu('layers')}
            className={menuButtonClass(openMenu === 'layers')}
            title="Layers"
          >
            <Layers size={16} />
          </button>

          <LayersMenu
            isOpen={openMenu === 'layers'}
            anchorRef={layersBtnRef}
            onClose={closeMenu}
            onLayerAdd={onLayerAdd}
            onLayerDelete={onLayerDelete}
          />

          <button
            type="button"
            onClick={onGridToggle}
            className={`rounded-lg p-2 transition-colors hover:bg-gray-100 ${
              toolState.showGrid
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-700'
            }`}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>

          <button
            type="button"
            onClick={onRulerToggle}
            className={`rounded-lg p-2 transition-colors hover:bg-gray-100 ${
              toolState.showRuler
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-700'
            }`}
            title="Toggle Ruler"
          >
            <Ruler size={16} />
          </button>

          <div className="flex-1" />

          <ZoomControls
            zoom={toolState.zoom ?? 100}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomTo={handleZoomTo}
            onResetZoom={handleResetZoom}
            onFitScreen={handleFitScreen}
          />
        </div>
      </div>
    </>
  );
};