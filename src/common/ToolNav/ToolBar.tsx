// components/toolbar/Toolbar.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  Settings, Brush, Type, Shapes, Eraser, Download, Upload, Save,
  Undo2, Redo2, Copy, Trash2, ZoomIn, ZoomOut, Maximize, Layers,
  Grid, Ruler, Move, ArrowRight, Minus, Hand, Eye,
  ChevronDown, Plus, Square, Circle, Triangle, Star, Heart,
} from 'lucide-react';
import { FileMenu } from './components/FileMenu';
import { BrushMenu } from './components/BrushMenu';
import { TextMenu } from './components/TextMenu';
import { ShapesMenu } from './components/ShapesMenu';
import { ArrowsMenu } from './components/ArrowsMenu';
import { LinesMenu } from './components/LinesMenu';
import { LayersMenu } from './components/LayersMenu';
import { ZoomControls } from './components/ZoomControls';
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

export const Toolbar: React.FC<ToolbarProps> = ({
  onImport, onExport, onSave, onUndo, onRedo, onCopy, onDelete,
  onZoomIn, onZoomOut, onFitScreen, onTextAdd, onShapeSelect,
  onArrowSelect, onLineSelect, onBrushSelect, onLayerAdd, onLayerDelete,
  onGridToggle, onRulerToggle, onEraserToggle, onMoveToggle,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const fileBtnRef = useRef<HTMLButtonElement>(null);
  const brushBtnRef = useRef<HTMLButtonElement>(null);
  const textBtnRef = useRef<HTMLButtonElement>(null);
  const shapesBtnRef = useRef<HTMLButtonElement>(null);
  const arrowsBtnRef = useRef<HTMLButtonElement>(null);
  const linesBtnRef = useRef<HTMLButtonElement>(null);
  const layersBtnRef = useRef<HTMLButtonElement>(null);

  const { toolState, updateToolState, setZoom } = useCanvasStore();

  const closeMenu = () => setOpenMenu(null);
  const toggleMenu = (menu: string) => setOpenMenu(openMenu === menu ? null : menu);

  const handleZoomIn = () => {
    setZoom(Math.min(500, toolState.zoom + 10));
    onZoomIn?.();
  };

  const handleZoomOut = () => {
    setZoom(Math.max(10, toolState.zoom - 10));
    onZoomOut?.();
  };

  const handleFitScreen = () => {
    setZoom(100);
    onFitScreen?.();
  };

  const toggleTool = (tool: string, callback?: () => void) => {
    updateToolState({ activeTool: toolState.activeTool === tool ? null : tool });
    callback?.();
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slideDown 0.15s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-0.5 h-12 px-2 overflow-x-auto scrollbar-hide">
          
          {/* File Menu */}
          <button
            ref={fileBtnRef}
            onClick={() => toggleMenu('file')}
            className="flex items-center gap-1 px-2 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings size={16} />
            <ChevronDown size={12} />
          </button>
          <FileMenu
            isOpen={openMenu === 'file'}
            anchorRef={fileBtnRef}
            onClose={closeMenu}
            onImport={onImport}
            onExport={onExport}
            onSave={onSave}
          />

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Edit Tools */}
          <button onClick={onUndo} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Undo (⌘Z)">
            <Undo2 size={16} />
          </button>
          <button onClick={onRedo} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Redo (⌘⇧Z)">
            <Redo2 size={16} />
          </button>
          <button onClick={onCopy} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Copy (⌘C)">
            <Copy size={16} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Brush Menu */}
          <button
            ref={brushBtnRef}
            onClick={() => toggleMenu('brush')}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.activeTool === 'brush' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Brush Tool (B)"
          >
            <Brush size={16} />
          </button>
          <BrushMenu
            isOpen={openMenu === 'brush'}
            anchorRef={brushBtnRef}
            onClose={closeMenu}
            onBrushSelect={onBrushSelect}
          />

          {/* Text Tool */}
          <button
            ref={textBtnRef}
            onClick={() => toggleMenu('text')}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.activeTool === 'text' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Text Tool (T)"
          >
            <Type size={16} />
          </button>
          <TextMenu
            isOpen={openMenu === 'text'}
            anchorRef={textBtnRef}
            onClose={closeMenu}
            onTextAdd={onTextAdd}
          />

          {/* Shapes Menu */}
          <button
            ref={shapesBtnRef}
            onClick={() => toggleMenu('shapes')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Shapes"
          >
            <Shapes size={16} />
          </button>
          <ShapesMenu
            isOpen={openMenu === 'shapes'}
            anchorRef={shapesBtnRef}
            onClose={closeMenu}
            onShapeSelect={onShapeSelect}
          />

          {/* Arrows Menu */}
          <button
            ref={arrowsBtnRef}
            onClick={() => toggleMenu('arrows')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Arrows"
          >
            <ArrowRight size={16} />
          </button>
          <ArrowsMenu
            isOpen={openMenu === 'arrows'}
            anchorRef={arrowsBtnRef}
            onClose={closeMenu}
            onArrowSelect={onArrowSelect}
          />

          {/* Lines Menu */}
          <button
            ref={linesBtnRef}
            onClick={() => toggleMenu('lines')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Lines"
          >
            <Minus size={16} />
          </button>
          <LinesMenu
            isOpen={openMenu === 'lines'}
            anchorRef={linesBtnRef}
            onClose={closeMenu}
            onLineSelect={onLineSelect}
          />

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Tool Buttons */}
          <button
            onClick={() => toggleTool('hand', onMoveToggle)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.activeTool === 'hand' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Hand Tool (H)"
          >
            <Hand size={16} />
          </button>

          <button
            onClick={() => toggleTool('eraser', onEraserToggle)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.activeTool === 'eraser' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Eraser Tool (E)"
          >
            <Eraser size={16} />
          </button>

          <button
            onClick={() => toggleTool('eyedropper')}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.activeTool === 'eyedropper' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Eye Dropper (I)"
          >
            <Eye size={16} />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Layers Menu */}
          <button
            ref={layersBtnRef}
            onClick={() => toggleMenu('layers')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            onClick={onGridToggle}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.showGrid ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>

          <button
            onClick={onRulerToggle}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              toolState.showRuler ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''
            }`}
            title="Toggle Ruler"
          >
            <Ruler size={16} />
          </button>

          <div className="flex-1" />

          {/* Zoom Controls */}
          <ZoomControls
            zoom={toolState.zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitScreen={handleFitScreen}
          />
        </div>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) onImport?.(e.target.files[0]);
            e.target.value = '';
          }}
        />
      </div>
    </>
  );
};