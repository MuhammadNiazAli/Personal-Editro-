// ─── canvasStore types ─────────────────────────────────────────────────────────
// Paste/merge into your canvasStore.ts

export interface Point {
  x: number;
  y: number;
}

export interface DrawElement {
  id: string;
  type: 'brush' | 'shape' | 'arrow' | 'line' | 'text';
  // brush
  points?: Point[];
  // shape / line
  position?: Point;
  endPosition?: Point;
  size?: number;
  color?: string;
  // shape options
  shapeType?: string;
  shapeFillMode?: 'filled' | 'outline' | 'filled-outline';
  shapeFillColor?: string;
  shapeStrokeColor?: string;
  shapeStrokeWidth?: number;
  shapeOpacity?: number;
  // arrow / line
  arrowType?: string;
  lineType?: string;
  // text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textStrike?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  // transform
  rotation?: number;
  opacity?: number;
}

export interface ToolState {
  activeTool: string | null;
  // brush
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  selectedBrush: string;
  // shape
  selectedShape: string | null;
  shapeFillMode: 'filled' | 'outline' | 'filled-outline';
  shapeFillColor: string;
  shapeStrokeColor: string;
  shapeStrokeWidth: number;
  shapeOpacity: number;
  // text
  fontFamily: string;
  fontSize: number;
  textColor: string;
  textBold: boolean;
  textItalic: boolean;
  textUnderline: boolean;
  textStrike: boolean;
  textAlign: 'left' | 'center' | 'right';
  // canvas
  isDrawing: boolean;
  isErasing: boolean;
  isMoving: boolean;
  zoom: number;
  showGrid: boolean;
  showRuler: boolean;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  elements: DrawElement[];
}

// ─── Default state for Zustand store ─────────────────────────────────────────
export const DEFAULT_TOOL_STATE: ToolState = {
  activeTool: null,
  brushSize: 4,
  brushColor: '#000000',
  brushOpacity: 1,
  selectedBrush: 'round',
  selectedShape: null,
  shapeFillMode: 'filled',
  shapeFillColor: '#4f46e5',
  shapeStrokeColor: '#1e1b4b',
  shapeStrokeWidth: 2,
  shapeOpacity: 1,
  fontFamily: 'Arial',
  fontSize: 20,
  textColor: '#000000',
  textBold: false,
  textItalic: false,
  textUnderline: false,
  textStrike: false,
  textAlign: 'left',
  isDrawing: false,
  isErasing: false,
  isMoving: false,
  zoom: 1,
  showGrid: false,
  showRuler: false,
};