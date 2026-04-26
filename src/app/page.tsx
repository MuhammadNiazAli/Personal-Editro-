'use client';

import Toolbar from '../common/ToolNav/ToolBar'; // adjust path as needed

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar
        onImport={(file) => console.log('Import:', file.name)}
        onExport={(format) => console.log('Export:', format)}
        onSave={() => console.log('Save')}
        onUndo={() => console.log('Undo')}
        onRedo={() => console.log('Redo')}
        onCopy={() => console.log('Copy')}
        onDelete={() => console.log('Delete')}
        onZoomIn={() => console.log('Zoom In')}
        onZoomOut={() => console.log('Zoom Out')}
        onFitScreen={() => console.log('Fit Screen')}
        onBrushSelect={(b) => console.log('Brush:', b.name)}
        onTextAdd={(font, size) => console.log('Text:', font, size)}
        onShapeSelect={(s) => console.log('Shape:', s.name)}
        onArrowSelect={(a) => console.log('Arrow:', a.name)}
        onLineSelect={(l) => console.log('Line:', l.name)}
        onEraserToggle={() => console.log('Eraser toggle')}
        onCropToggle={() => console.log('Crop toggle')}
        onMoveToggle={() => console.log('Move toggle')}
        onLayerAdd={() => console.log('Layer Add')}
        onLayerDelete={() => console.log('Layer Delete')}
        onGridToggle={() => console.log('Grid toggle')}
        onRulerToggle={() => console.log('Ruler toggle')}
      />

      {/* Canvas area — offset by toolbar height (h-12 = 48px) */}
      <div className="pt-12 h-screen">
        <div className="h-full flex items-center justify-center bg-[#f8f9fa]">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="36" height="36" rx="6" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 3"/>
              <path d="M24 18v12M18 24h12" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm">Canvas area — start drawing</span>
          </div>
        </div>
      </div>
    </div>
  );
}