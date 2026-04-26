'use client';

import React, { useMemo } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  CopyPlus,
  Layers,
  Check,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';
import { useCanvasStore } from '../components/store/canvasStore';

interface LayersMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onLayerAdd?: () => void;
  onLayerDelete?: () => void;
}

type CanvasLayer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  elements: any[];
};

type LayerStoreShape = {
  layers: CanvasLayer[];
  activeLayerId: string;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  addLayer?: () => void;
  deleteLayer?: (id?: string) => void;
  duplicateLayer?: (id?: string) => void;
  moveLayerUp?: (id?: string) => void;
  moveLayerDown?: (id?: string) => void;
};

function cloneElementSafely(element: any) {
  return {
    ...element,
    id: `${element.type ?? 'element'}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
  };
}

function updateZustandStore(updater: (state: any) => any) {
  const storeApi = useCanvasStore as any;

  if (typeof storeApi.setState === 'function') {
    storeApi.setState(updater);
  }
}

export const LayersMenu: React.FC<LayersMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onLayerAdd,
  onLayerDelete,
}) => {
  const store = useCanvasStore() as unknown as LayerStoreShape;

  const {
    layers,
    activeLayerId,
    setActiveLayer,
    toggleLayerVisibility,
    toggleLayerLock,
  } = store;

  const activeLayer = useMemo(() => {
    return layers.find((layer) => layer.id === activeLayerId) ?? layers[0];
  }, [activeLayerId, layers]);

  const activeIndex = useMemo(() => {
    return layers.findIndex((layer) => layer.id === activeLayerId);
  }, [activeLayerId, layers]);

  const canDelete = layers.length > 1 && Boolean(activeLayer);
  const canMoveUp = activeIndex > 0;
  const canMoveDown = activeIndex >= 0 && activeIndex < layers.length - 1;

  const handleAddLayer = () => {
    if (onLayerAdd) {
      onLayerAdd();
      onClose();
      return;
    }

    if (typeof store.addLayer === 'function') {
      store.addLayer();
      onClose();
      return;
    }

    updateZustandStore((state: any) => {
      const currentLayers: CanvasLayer[] = state.layers ?? [];
      const nextLayer: CanvasLayer = {
        id: `layer-${Date.now()}`,
        name: `Layer ${currentLayers.length + 1}`,
        visible: true,
        locked: false,
        elements: [],
      };

      return {
        ...state,
        layers: [...currentLayers, nextLayer],
        activeLayerId: nextLayer.id,
      };
    });

    onClose();
  };

  const handleDeleteLayer = () => {
    if (!canDelete || !activeLayer) return;

    if (onLayerDelete) {
      onLayerDelete();
      onClose();
      return;
    }

    if (typeof store.deleteLayer === 'function') {
      store.deleteLayer(activeLayer.id);
      onClose();
      return;
    }

    updateZustandStore((state: any) => {
      const currentLayers: CanvasLayer[] = state.layers ?? [];
      const deletingIndex = currentLayers.findIndex(
        (layer) => layer.id === activeLayer.id,
      );

      const nextLayers = currentLayers.filter(
        (layer) => layer.id !== activeLayer.id,
      );

      const nextActiveLayer =
        nextLayers[Math.max(0, deletingIndex - 1)] ?? nextLayers[0];

      return {
        ...state,
        layers: nextLayers,
        activeLayerId: nextActiveLayer?.id ?? '',
      };
    });

    onClose();
  };

  const handleDuplicateLayer = () => {
    if (!activeLayer) return;

    if (typeof store.duplicateLayer === 'function') {
      store.duplicateLayer(activeLayer.id);
      onClose();
      return;
    }

    updateZustandStore((state: any) => {
      const currentLayers: CanvasLayer[] = state.layers ?? [];
      const index = currentLayers.findIndex(
        (layer) => layer.id === activeLayer.id,
      );

      const duplicate: CanvasLayer = {
        ...activeLayer,
        id: `layer-${Date.now()}`,
        name: `${activeLayer.name} Copy`,
        visible: true,
        locked: false,
        elements: (activeLayer.elements ?? []).map(cloneElementSafely),
      };

      const nextLayers = [...currentLayers];
      nextLayers.splice(index + 1, 0, duplicate);

      return {
        ...state,
        layers: nextLayers,
        activeLayerId: duplicate.id,
      };
    });

    onClose();
  };

  const handleMoveLayer = (direction: 'up' | 'down') => {
    if (!activeLayer) return;

    if (direction === 'up' && typeof store.moveLayerUp === 'function') {
      store.moveLayerUp(activeLayer.id);
      return;
    }

    if (direction === 'down' && typeof store.moveLayerDown === 'function') {
      store.moveLayerDown(activeLayer.id);
      return;
    }

    updateZustandStore((state: any) => {
      const currentLayers: CanvasLayer[] = [...(state.layers ?? [])];
      const index = currentLayers.findIndex(
        (layer) => layer.id === activeLayer.id,
      );

      if (index < 0) return state;

      const nextIndex = direction === 'up' ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= currentLayers.length) return state;

      const temp = currentLayers[index];
      currentLayers[index] = currentLayers[nextIndex];
      currentLayers[nextIndex] = temp;

      return {
        ...state,
        layers: currentLayers,
      };
    });
  };

  return (
    <PortalDropdown
      isOpen={isOpen}
      anchorRef={anchorRef}
      onClose={onClose}
      width={326}
      align="left"
    >
      <div className="rounded-2xl bg-white text-sm">
        <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-3 py-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Layers size={15} />
                </span>

                <span>Layers</span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {activeLayer?.name ?? 'No layer selected'}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
              {layers.length} total
            </span>
          </div>
        </div>

        <div className="space-y-3 p-3">
          <section>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Layer Actions
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleAddLayer}
                className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Plus size={14} />
                Add
              </button>

              <button
                type="button"
                onClick={handleDuplicateLayer}
                disabled={!activeLayer}
                className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CopyPlus size={14} />
                Duplicate
              </button>

              <button
                type="button"
                onClick={handleDeleteLayer}
                disabled={!canDelete}
                className="col-span-2 flex h-9 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-2 text-[12px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} />
                Delete Active Layer
              </button>
            </div>
          </section>

          <section>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Layer List
            </label>

            <div className="max-h-[230px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1.5">
              <div className="space-y-1">
                {layers.map((layer, index) => {
                  const isActive = activeLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      className={`flex items-center gap-1.5 rounded-xl border px-2 py-2 transition ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                          : 'border-transparent bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleLayerLock(layer.id)}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                          layer.locked
                            ? isActive
                              ? 'bg-red-400/30 text-white'
                              : 'bg-red-50 text-red-500'
                            : isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                      >
                        {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveLayer(layer.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-[12px] font-semibold">
                          {layer.name}
                        </span>

                        <span
                          className={`block truncate text-[10px] ${
                            isActive ? 'text-indigo-100' : 'text-gray-400'
                          }`}
                        >
                          {layer.elements?.length ?? 0} objects · #{index + 1}
                        </span>
                      </button>

                      {isActive && (
                        <Check size={14} className="shrink-0 text-current" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Order
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleMoveLayer('up')}
                disabled={!canMoveUp}
                className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp size={14} />
                Up
              </button>

              <button
                type="button"
                onClick={() => handleMoveLayer('down')}
                disabled={!canMoveDown}
                className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowDown size={14} />
                Down
              </button>
            </div>
          </section>
        </div>
      </div>
    </PortalDropdown>
  );
};