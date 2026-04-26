'use client';

import React, { useRef, useState } from 'react';

import { Toolbar } from '../common/ToolNav/ToolBar';
import { Canvas } from '../common/ToolNav/components/canvas/Canvas';
import { useCanvasStore } from '../common/ToolNav/components/store/canvasStore';

type PanPoint = {
  x: number;
  y: number;
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [pan, setPan] = useState<PanPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const panStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    panX: number;
    panY: number;
  } | null>(null);

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
    activeLayerId,
  } = useCanvasStore();

  const handleExport = (format: string) => {
    if (!canvasRef.current) return;

    const normalizedFormat = format.toLowerCase();

    const mimeType =
      normalizedFormat === 'jpg' || normalizedFormat === 'jpeg'
        ? 'image/jpeg'
        : normalizedFormat === 'png'
          ? 'image/png'
          : 'image/png';

    const dataUrl = canvasRef.current.toDataURL(mimeType);
    const link = document.createElement('a');

    link.download = `canvas.${normalizedFormat}`;
    link.href = dataUrl;
    link.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        saveToHistory();
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleZoomTo = (zoom: number) => {
    const safeZoom = Math.min(Math.max(zoom, 10), 500);
    setZoom(safeZoom);
  };

  const handleZoomIn = () => {
    handleZoomTo((toolState.zoom ?? 100) + 10);
  };

  const handleZoomOut = () => {
    handleZoomTo((toolState.zoom ?? 100) - 10);
  };

  const handleFitScreen = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const handleResetZoom = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (toolState.activeTool !== 'hand') return;

    setIsPanning(true);

    panStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !panStartRef.current) return;

    const deltaX = event.clientX - panStartRef.current.mouseX;
    const deltaY = event.clientY - panStartRef.current.mouseY;

    setPan({
      x: panStartRef.current.panX + deltaX,
      y: panStartRef.current.panY + deltaY,
    });
  };

  const stopPanning = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  const handleBrushSelect = (brush: any) => {
    updateToolState({
      activeTool: 'brush',
      selectedBrush: brush.id,
      brushSize: brush.size ?? toolState.brushSize,
      brushColor: brush.color ?? toolState.brushColor,
      brushOpacity: brush.opacity ?? toolState.brushOpacity,
      brushMode: brush.mode ?? toolState.brushMode,
      brushSpacing: brush.spacing ?? toolState.brushSpacing,
      brushJitter: brush.jitter ?? toolState.brushJitter,
      brushScatter: brush.scatter ?? toolState.brushScatter,
      brushSoftness: brush.softness ?? toolState.brushSoftness,
      brushAngle: brush.angle ?? toolState.brushAngle,
      brushPressure: brush.pressure ?? toolState.brushPressure,
      brushGlow: brush.glow ?? toolState.brushGlow,
      brushTexture: brush.texture ?? toolState.brushTexture,
      brushComposite:
        brush.mode === 'eraser' ? 'destination-out' : 'source-over',
    });
  };

  const handleTextAdd = (font?: string, size?: number) => {
    updateToolState({
      activeTool: 'text',
      fontFamily: font || 'Arial',
      fontSize: size || 16,
    });
  };

  const handleShapeSelect = (shape: any) => {
    updateToolState({
      activeTool: 'shape',
      selectedShape: shape?.id ?? shape?.type ?? toolState.selectedShape,
    });
  };

  const handleArrowSelect = (arrow: any) => {
    updateToolState({
      activeTool: 'arrow',
      selectedArrow: arrow?.id ?? toolState.selectedArrow,
      arrowDirection: arrow?.direction ?? toolState.arrowDirection,
      arrowPathType: arrow?.pathType ?? toolState.arrowPathType,
      arrowHeadStart: arrow?.headStart ?? toolState.arrowHeadStart,
      arrowHeadEnd: arrow?.headEnd ?? toolState.arrowHeadEnd,
      arrowStrokeStyle: arrow?.strokeStyle ?? toolState.arrowStrokeStyle,
      arrowStrokeWidth: arrow?.strokeWidth ?? toolState.arrowStrokeWidth,
    });
  };

  const handleLineSelect = (line: any) => {
    updateToolState({
      activeTool: 'line',
      selectedLine: line?.id ?? toolState.selectedLine,
      linePathType: line?.pathType ?? toolState.linePathType,
      lineStrokeStyle: line?.strokeStyle ?? toolState.lineStrokeStyle,
      lineStrokeWidth: line?.strokeWidth ?? toolState.lineStrokeWidth,
      lineCap: line?.lineCap ?? toolState.lineCap,
      lineDash: line?.dash ?? toolState.lineDash,
    });
  };

  const handleEraserToggle = () => {
    updateToolState({
      activeTool: 'eraser',
      selectedBrush: 'eraser',
      brushMode: 'eraser',
      brushComposite: 'destination-out',
      brushOpacity: 1,
    });
  };

  const handleMoveToggle = () => {
    updateToolState({
      activeTool: 'hand',
    });
  };

  const handleLayerDelete = () => {
    if (!activeLayerId) return;
    deleteLayer(activeLayerId);
  };

  const handleCopy = () => {
    console.log('Copy action needs selected element support.');
  };

  const handleDelete = () => {
    console.log('Delete action needs selected element support.');
  };

  const zoomScale = (toolState.zoom ?? 100) / 100;

  const stageCursor =
    toolState.activeTool === 'hand'
      ? isPanning
        ? 'grabbing'
        : 'grab'
      : 'default';

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar
        onImport={handleImport}
        onExport={handleExport}
        onSave={saveToHistory}
        onUndo={undo}
        onRedo={redo}
        onCopy={handleCopy}
        onDelete={handleDelete}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomTo={handleZoomTo}
        onResetZoom={handleResetZoom}
        onFitScreen={handleFitScreen}
        onBrushSelect={handleBrushSelect}
        onTextAdd={handleTextAdd}
        onShapeSelect={handleShapeSelect}
        onArrowSelect={handleArrowSelect}
        onLineSelect={handleLineSelect}
        onEraserToggle={handleEraserToggle}
        onMoveToggle={handleMoveToggle}
        onLayerAdd={addLayer}
        onLayerDelete={handleLayerDelete}
        onGridToggle={toggleGrid}
        onRulerToggle={toggleRuler}
      />

      <div className="h-screen pt-12">
        <div
          ref={stageRef}
          className="relative h-full w-full overflow-hidden bg-gray-100"
          style={{
            cursor: stageCursor,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopPanning}
          onMouseLeave={stopPanning}
        >
          <div
            className="h-full w-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 120ms ease-out',
            }}
          >
            <Canvas
              onCanvasReady={(canvas) => {
                canvasRef.current = canvas;
              }}
            />
          </div>

          {toolState.activeTool === 'hand' && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-black/5">
              Hand tool active · drag canvas to move
            </div>
          )}
        </div>
      </div>
    </div>
  );
}