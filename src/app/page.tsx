'use client';

import React, { useRef } from 'react';
import { Toolbar } from '../common/ToolNav/ToolBar';
import { Canvas } from '../common/ToolNav/components/canvas/Canvas';
import { useCanvasStore } from '../common/ToolNav/components/store/canvasStore';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    undo,
    redo,
    addLayer,
    deleteLayer,
    toggleGrid,
    toggleRuler,
    updateToolState,
    setZoom,
    saveToHistory,
    toolState,
    activeLayerId,  // ✅ YEH ADD KARO - missing tha
  } = useCanvasStore();

  const handleExport = (format: string) => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL(`image/${format.toLowerCase()}`);
    const link = document.createElement('a');
    link.download = `canvas.${format.toLowerCase()}`;
    link.href = dataUrl;
    link.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleZoomIn = () => setZoom(Math.min(500, toolState.zoom + 10));
  const handleZoomOut = () => setZoom(Math.max(10, toolState.zoom - 10));
  const handleFitScreen = () => setZoom(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar
        onImport={handleImport}
        onExport={handleExport}
        onSave={saveToHistory}
        onUndo={undo}
        onRedo={redo}
        onCopy={() => console.log('Copy')}
        onDelete={() => console.log('Delete')}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitScreen={handleFitScreen}
        onBrushSelect={(brush) => updateToolState({ selectedBrush: brush.id, activeTool: 'brush' })}
        onTextAdd={(font, size) => updateToolState({ fontFamily: font || 'Arial', fontSize: size || 16, activeTool: 'text' })}
        onShapeSelect={(shape) => updateToolState({ activeTool: 'shape' })}
        onArrowSelect={(arrow) => updateToolState({ activeTool: 'arrow' })}
        onLineSelect={(line) => updateToolState({ activeTool: 'line' })}
        onEraserToggle={() => updateToolState({ activeTool: 'eraser' })}
        onMoveToggle={() => updateToolState({ activeTool: 'hand' })}
        onLayerAdd={addLayer}
        onLayerDelete={() => deleteLayer(activeLayerId)}  
        onGridToggle={toggleGrid}
        onRulerToggle={toggleRuler}
      />

      <div className="pt-12 h-screen">
        <div className="h-full w-full">
          <Canvas onCanvasReady={(canvas) => { canvasRef.current = canvas; }} />
        </div>
      </div>
    </div>
  );
}