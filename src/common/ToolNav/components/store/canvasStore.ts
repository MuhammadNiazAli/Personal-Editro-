import { create } from 'zustand';

export interface Point { x: number; y: number; }

export interface DrawElement {
  id: string;
  type: 'brush' | 'shape' | 'arrow' | 'line' | 'text';
  points?: Point[];
  position?: Point;
  size?: number;
  color?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  shapeType?: string;
  arrowType?: string;
  lineType?: string;
  opacity?: number;
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
  fontFamily: string;
  fontSize: number;
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
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setActiveLayer: (id: string) => void;
  
  updateToolState: (updates: Partial<ToolState>) => void;
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

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: [],
  layers: [DEFAULT_LAYER],
  activeLayerId: 'layer-1',
  toolState: {
    activeTool: null,
    brushSize: 4,
    brushColor: '#000000',
    brushOpacity: 100,
    selectedBrush: 'pencil',
    fontFamily: 'Arial',
    fontSize: 16,
    showGrid: false,
    showRuler: false,
    zoom: 100,
  },
  history: [],
  historyIndex: -1,

  addElement: (element) => {
    const { layers, activeLayerId } = get();
    const updatedLayers = layers.map(layer =>
      layer.id === activeLayerId && !layer.locked
        ? { ...layer, elements: [...layer.elements, element] }
        : layer
    );
    set({ layers: updatedLayers });
    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    const { layers, activeLayerId } = get();
    const updatedLayers = layers.map(layer =>
      layer.id === activeLayerId && !layer.locked
        ? {
            ...layer,
            elements: layer.elements.map(el =>
              el.id === id ? { ...el, ...updates } : el
            ),
          }
        : layer
    );
    set({ layers: updatedLayers });
    get().saveToHistory();
  },

  deleteElement: (id) => {
    const { layers, activeLayerId } = get();
    const updatedLayers = layers.map(layer =>
      layer.id === activeLayerId && !layer.locked
        ? { ...layer, elements: layer.elements.filter(el => el.id !== id) }
        : layer
    );
    set({ layers: updatedLayers });
    get().saveToHistory();
  },

  saveToHistory: () => {
    const { layers, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(layers)));
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ layers: history[historyIndex - 1], historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ layers: history[historyIndex + 1], historyIndex: historyIndex + 1 });
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
    set({ layers: [...layers, newLayer], activeLayerId: newLayer.id });
    get().saveToHistory();
  },

  deleteLayer: (id) => {
    const { layers, activeLayerId } = get();
    if (layers.length === 1) return;
    const filtered = layers.filter(l => l.id !== id);
    const newActiveId = activeLayerId === id ? filtered[0].id : activeLayerId;
    set({ layers: filtered, activeLayerId: newActiveId });
    get().saveToHistory();
  },

  toggleLayerVisibility: (id) => {
    const { layers } = get();
    set({
      layers: layers.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    });
  },

  toggleLayerLock: (id) => {
    const { layers } = get();
    set({
      layers: layers.map(layer =>
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      ),
    });
  },

  setActiveLayer: (id) => set({ activeLayerId: id }),

  updateToolState: (updates) => {
    set(state => ({
      toolState: { ...state.toolState, ...updates },
    }));
  },

  toggleGrid: () => {
    set(state => ({
      toolState: { ...state.toolState, showGrid: !state.toolState.showGrid },
    }));
  },

  toggleRuler: () => {
    set(state => ({
      toolState: { ...state.toolState, showRuler: !state.toolState.showRuler },
    }));
  },

  setZoom: (zoom) => {
    set(state => ({
      toolState: { ...state.toolState, zoom },
    }));
  },
}));