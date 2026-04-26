import { create } from 'zustand';

export interface Point {
  x: number;
  y: number;
}

export type TextAlign = 'left' | 'center' | 'right';

export type BrushMode =
  | 'normal'
  | 'pencil'
  | 'pen'
  | 'marker'
  | 'calligraphy'
  | 'spray'
  | 'dotted'
  | 'square'
  | 'glow'
  | 'watercolor'
  | 'crayon'
  | 'chalk'
  | 'charcoal'
  | 'neon'
  | 'ribbon'
  | 'fur'
  | 'sketch'
  | 'ink'
  | 'shadow'
  | 'eraser';

export type LinePathType =
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

export type LineCapType = 'butt' | 'round' | 'square';

export type ArrowDirection =
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

export type ArrowPathType =
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

export type ArrowHeadType =
  | 'triangle'
  | 'open'
  | 'filled'
  | 'diamond'
  | 'circle'
  | 'bar'
  | 'none';

export type IconCategory =
  | 'social'
  | 'finance'
  | 'media'
  | 'business'
  | 'general';

export interface CanvasIconData {
  key: string;
  name: string;
  category: IconCategory;
  symbol?: string;
}

export interface DrawElement {
  id: string;

  type:
    | 'brush'
    | 'shape'
    | 'arrow'
    | 'line'
    | 'text'
    | 'icon';

  points?: Point[];
  position?: Point;
  endPosition?: Point;

  size?: number;
  color?: string;
  opacity?: number;

  text?: string;
  fontFamily?: string;
  fontSize?: number;

  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textStrike?: boolean;
  textAlign?: TextAlign;
  textBoxWidth?: number;
  width?: number;

  shapeType?: string;
  shapeFillMode?: 'filled' | 'outline' | 'filled-outline';
  shapeFillColor?: string;
  shapeStrokeColor?: string;
  shapeStrokeWidth?: number;
  shapeOpacity?: number;

  arrowType?: string;
  selectedArrow?: string;
  arrowDirection?: ArrowDirection;
  arrowPathType?: ArrowPathType;
  arrowHeadStart?: ArrowHeadType;
  arrowHeadEnd?: ArrowHeadType;
  arrowStrokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  arrowStrokeWidth?: number;
  arrowColor?: string;

  lineType?: string;
  selectedLine?: string;
  linePathType?: LinePathType;
  lineStrokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  lineStrokeWidth?: number;
  lineCap?: LineCapType;
  lineDash?: number[];
  lineColor?: string;

  brushMode?: BrushMode;
  selectedBrush?: string;
  brushSpacing?: number;
  brushJitter?: number;
  brushScatter?: number;
  brushSoftness?: number;
  brushAngle?: number;
  brushPressure?: number;
  brushGlow?: number;
  brushTexture?: boolean;
  brushComposite?: GlobalCompositeOperation;

  iconKey?: string;
  iconName?: string;
  iconCategory?: IconCategory;
  iconSymbol?: string;
  iconSize?: number;
  iconColor?: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  elements: DrawElement[];
}

export interface ToolState {
  activeTool: string | null;

  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  selectedBrush: string;

  brushMode?: BrushMode;
  brushSpacing?: number;
  brushJitter?: number;
  brushScatter?: number;
  brushSoftness?: number;
  brushAngle?: number;
  brushPressure?: number;
  brushGlow?: number;
  brushTexture?: boolean;
  brushComposite?: GlobalCompositeOperation;

  fontFamily: string;
  fontSize: number;

  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textStrike?: boolean;
  textAlign?: TextAlign;
  textBoxWidth?: number;

  selectedShape?: string;
  shapeFillMode?: 'filled' | 'outline' | 'filled-outline';
  shapeFillColor?: string;
  shapeStrokeColor?: string;
  shapeStrokeWidth?: number;
  shapeOpacity?: number;

  selectedLine?: string;
  linePathType?: LinePathType;
  lineStrokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  lineStrokeWidth?: number;
  lineCap?: LineCapType;
  lineDash?: number[];
  lineColor?: string;

  selectedArrow?: string;
  arrowDirection?: ArrowDirection;
  arrowPathType?: ArrowPathType;
  arrowHeadStart?: ArrowHeadType;
  arrowHeadEnd?: ArrowHeadType;
  arrowStrokeStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  arrowStrokeWidth?: number;
  arrowColor?: string;

  selectedIcon?: CanvasIconData | null;
  selectedIconKey?: string;
  selectedIconName?: string;
  selectedIconCategory?: IconCategory;
  selectedIconSymbol?: string;
  iconSize?: number;
  iconColor?: string;

  showGrid: boolean;
  showRuler: boolean;
  zoom: number;
}

interface CanvasStore {
  elements: DrawElement[];
  layers: Layer[];
  activeLayerId: string;
  toolState: ToolState;
  history: Layer[][];
  historyIndex: number;

  addElement: (element: DrawElement) => void;
  updateElement: (id: string, updates: Partial<DrawElement>) => void;
  deleteElement: (id: string) => void;

  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  addLayer: () => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id?: string) => void;
  moveLayerUp: (id?: string) => void;
  moveLayerDown: (id?: string) => void;

  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setActiveLayer: (id: string) => void;

  updateToolState: (updates: Partial<ToolState>) => void;
  selectIconTool: (icon: CanvasIconData) => void;
  clearSelectedIcon: () => void;

  toggleGrid: () => void;
  toggleRuler: () => void;
  setZoom: (zoom: number) => void;
}

const DEFAULT_LAYER: Layer = {
  id: 'layer-1',
  name: 'Layer 1',
  visible: true,
  locked: false,
  elements: [],
};

const cloneLayers = (layers: Layer[]) => {
  return JSON.parse(JSON.stringify(layers)) as Layer[];
};

const createElementId = (type: string) => {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: [],
  layers: [DEFAULT_LAYER],
  activeLayerId: 'layer-1',

  toolState: {
    activeTool: null,

    brushSize: 4,
    brushColor: '#000000',
    brushOpacity: 1,
    selectedBrush: 'pencil',

    brushMode: 'pencil',
    brushSpacing: 1,
    brushJitter: 0,
    brushScatter: 0,
    brushSoftness: 0,
    brushAngle: 0,
    brushPressure: 0,
    brushGlow: 0,
    brushTexture: false,
    brushComposite: 'source-over',

    fontFamily: 'Arial',
    fontSize: 16,

    textColor: '#111827',
    textBold: false,
    textItalic: false,
    textUnderline: false,
    textStrike: false,
    textAlign: 'left',
    textBoxWidth: 260,

    selectedShape: 'rectangle',
    shapeFillMode: 'filled',
    shapeFillColor: '#4f46e5',
    shapeStrokeColor: '#1e1b4b',
    shapeStrokeWidth: 2,
    shapeOpacity: 1,

    selectedLine: 'straight',
    linePathType: 'straight',
    lineStrokeStyle: 'solid',
    lineStrokeWidth: 3,
    lineCap: 'round',
    lineDash: [],
    lineColor: '#111827',

    selectedArrow: 'arrow-right',
    arrowDirection: 'right',
    arrowPathType: 'straight',
    arrowHeadStart: 'none',
    arrowHeadEnd: 'triangle',
    arrowStrokeStyle: 'solid',
    arrowStrokeWidth: 3,
    arrowColor: '#111827',

    selectedIcon: null,
    selectedIconKey: '',
    selectedIconName: '',
    selectedIconCategory: 'general',
    selectedIconSymbol: '',
    iconSize: 44,
    iconColor: '#111827',

    showGrid: false,
    showRuler: false,
    zoom: 100,
  },

  history: [],
  historyIndex: -1,

  addElement: (element) => {
    const { layers, activeLayerId } = get();

    const updatedLayers = layers.map((layer) => {
      if (layer.id !== activeLayerId || layer.locked) return layer;

      return {
        ...layer,
        elements: [...layer.elements, element],
      };
    });

    set({
      layers: updatedLayers,
      elements: updatedLayers.flatMap((layer) => layer.elements),
    });

    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    const { layers } = get();

    const updatedLayers = layers.map((layer) => {
      if (layer.locked) return layer;

      return {
        ...layer,
        elements: layer.elements.map((element) =>
          element.id === id
            ? {
                ...element,
                ...updates,
              }
            : element,
        ),
      };
    });

    set({
      layers: updatedLayers,
      elements: updatedLayers.flatMap((layer) => layer.elements),
    });

    get().saveToHistory();
  },

  deleteElement: (id) => {
    const { layers } = get();

    const updatedLayers = layers.map((layer) => {
      if (layer.locked) return layer;

      return {
        ...layer,
        elements: layer.elements.filter((element) => element.id !== id),
      };
    });

    set({
      layers: updatedLayers,
      elements: updatedLayers.flatMap((layer) => layer.elements),
    });

    get().saveToHistory();
  },

  saveToHistory: () => {
    const { layers, history, historyIndex } = get();

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(cloneLayers(layers));

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const previousLayers = cloneLayers(history[historyIndex - 1]);

      set({
        layers: previousLayers,
        elements: previousLayers.flatMap((layer) => layer.elements),
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const nextLayers = cloneLayers(history[historyIndex + 1]);

      set({
        layers: nextLayers,
        elements: nextLayers.flatMap((layer) => layer.elements),
        historyIndex: historyIndex + 1,
      });
    }
  },

  addLayer: () => {
    const { layers } = get();

    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      elements: [],
    };

    set({
      layers: [...layers, newLayer],
      activeLayerId: newLayer.id,
    });

    get().saveToHistory();
  },

  deleteLayer: (id) => {
    const { layers, activeLayerId } = get();

    if (layers.length === 1) return;

    const filteredLayers = layers.filter((layer) => layer.id !== id);

    const newActiveId =
      activeLayerId === id
        ? filteredLayers[0]?.id ?? ''
        : activeLayerId;

    set({
      layers: filteredLayers,
      elements: filteredLayers.flatMap((layer) => layer.elements),
      activeLayerId: newActiveId,
    });

    get().saveToHistory();
  },

  duplicateLayer: (id) => {
    const { layers, activeLayerId } = get();

    const targetId = id ?? activeLayerId;
    const index = layers.findIndex((layer) => layer.id === targetId);

    if (index === -1) return;

    const sourceLayer = layers[index];

    const duplicateLayer: Layer = {
      ...sourceLayer,
      id: `layer-${Date.now()}`,
      name: `${sourceLayer.name} Copy`,
      visible: true,
      locked: false,
      elements: sourceLayer.elements.map((element) => ({
        ...element,
        id: createElementId(element.type),
      })),
    };

    const nextLayers = [...layers];
    nextLayers.splice(index + 1, 0, duplicateLayer);

    set({
      layers: nextLayers,
      elements: nextLayers.flatMap((layer) => layer.elements),
      activeLayerId: duplicateLayer.id,
    });

    get().saveToHistory();
  },

  moveLayerUp: (id) => {
    const { layers, activeLayerId } = get();

    const targetId = id ?? activeLayerId;
    const index = layers.findIndex((layer) => layer.id === targetId);

    if (index <= 0) return;

    const nextLayers = [...layers];
    const temp = nextLayers[index - 1];

    nextLayers[index - 1] = nextLayers[index];
    nextLayers[index] = temp;

    set({
      layers: nextLayers,
    });

    get().saveToHistory();
  },

  moveLayerDown: (id) => {
    const { layers, activeLayerId } = get();

    const targetId = id ?? activeLayerId;
    const index = layers.findIndex((layer) => layer.id === targetId);

    if (index === -1 || index >= layers.length - 1) return;

    const nextLayers = [...layers];
    const temp = nextLayers[index + 1];

    nextLayers[index + 1] = nextLayers[index];
    nextLayers[index] = temp;

    set({
      layers: nextLayers,
    });

    get().saveToHistory();
  },

  toggleLayerVisibility: (id) => {
    const { layers } = get();

    const updatedLayers = layers.map((layer) =>
      layer.id === id
        ? {
            ...layer,
            visible: !layer.visible,
          }
        : layer,
    );

    set({
      layers: updatedLayers,
    });
  },

  toggleLayerLock: (id) => {
    const { layers } = get();

    const updatedLayers = layers.map((layer) =>
      layer.id === id
        ? {
            ...layer,
            locked: !layer.locked,
          }
        : layer,
    );

    set({
      layers: updatedLayers,
    });
  },

  setActiveLayer: (id) => {
    set({
      activeLayerId: id,
    });
  },

  updateToolState: (updates) => {
    set((state) => ({
      toolState: {
        ...state.toolState,
        ...updates,
      },
    }));
  },

  selectIconTool: (icon) => {
    set((state) => ({
      toolState: {
        ...state.toolState,
        activeTool: 'icon',
        selectedIcon: icon,
        selectedIconKey: icon.key,
        selectedIconName: icon.name,
        selectedIconCategory: icon.category,
        selectedIconSymbol: icon.symbol ?? '',
        iconSize: state.toolState.iconSize ?? 44,
        iconColor: state.toolState.iconColor ?? state.toolState.brushColor,
      },
    }));
  },

  clearSelectedIcon: () => {
    set((state) => ({
      toolState: {
        ...state.toolState,
        selectedIcon: null,
        selectedIconKey: '',
        selectedIconName: '',
        selectedIconSymbol: '',
      },
    }));
  },

  toggleGrid: () => {
    set((state) => ({
      toolState: {
        ...state.toolState,
        showGrid: !state.toolState.showGrid,
      },
    }));
  },

  toggleRuler: () => {
    set((state) => ({
      toolState: {
        ...state.toolState,
        showRuler: !state.toolState.showRuler,
      },
    }));
  },

  setZoom: (zoom) => {
    const safeZoom = Math.min(Math.max(zoom, 10), 500);

    set((state) => ({
      toolState: {
        ...state.toolState,
        zoom: safeZoom,
      },
    }));
  },
}));