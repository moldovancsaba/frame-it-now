import { create } from 'zustand';
import { Layer, NewLayer, LayerUpdate } from '../types/layers';

async function fetchLayers(): Promise<Layer[]> {
  const response = await fetch('/api/layers');
  if (!response.ok) {
    throw new Error('Failed to fetch layers');
  }
  return response.json();
}

async function createLayer(layer: NewLayer): Promise<Layer> {
  const response = await fetch('/api/layers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(layer)
  });
  if (!response.ok) {
    throw new Error('Failed to create layer');
  }
  return response.json();
}

async function updateLayerById(id: string, layer: LayerUpdate): Promise<void> {
  const response = await fetch('/api/layers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...layer })
  });
  if (!response.ok) {
    throw new Error('Failed to update layer');
  }
}

async function deleteLayerById(id: string): Promise<void> {
  const response = await fetch(`/api/layers?id=${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete layer');
  }
}

interface ILayersStore {
  layers: Layer[];
  isLoading: boolean;
  error: string | null;
  fetchLayers: () => Promise<void>;
  addLayer: (layer: NewLayer) => Promise<void>;
  updateLayer: (id: string, layer: LayerUpdate) => Promise<void>;
  removeLayer: (id: string) => Promise<void>;
  reorderLayer: (id: string, newOrder: number) => Promise<void>;
  toggleLayerVisibility: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useLayersStore = create<ILayersStore>((set, get) => ({
  layers: [],
  isLoading: false,
  error: null,

  setError: (error): void => set({ error }),
  fetchLayers: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const layers = await fetchLayers();
      set({ layers, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch layers', isLoading: false });
    }
  },

  addLayer: async (layer: NewLayer): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Validate image URL
      if (layer.type === 'image' && (!layer.url || !layer.url.trim())) {
        throw new Error('Invalid image URL');
      }
      const newLayer = await createLayer(layer);
      set((state) => ({
        layers: [...state.layers, newLayer],
        isLoading: false
      }));
    } catch {
      set({ error: 'Failed to add layer', isLoading: false });
    }
  },

  updateLayer: async (id: string, updatedLayer: LayerUpdate): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await updateLayerById(id, updatedLayer);
      set((state) => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, ...updatedLayer } as Layer : layer
        ),
        isLoading: false
      }));
    } catch {
      set({ error: 'Failed to update layer', isLoading: false });
    }
  },

  removeLayer: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await deleteLayerById(id);
      set((state) => ({
        layers: state.layers.filter(layer => layer.id !== id),
        isLoading: false
      }));
    } catch {
      set({ error: 'Failed to remove layer', isLoading: false });
    }
  },

  reorderLayer: async (id: string, newOrder: number): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const currentLayers = get().layers;
      const layer = currentLayers.find(l => l.id === id);
      if (!layer) {
        throw new Error('Layer not found');
      }

      // Calculate the new order for all affected layers
      const reorderedLayers = currentLayers
        .map(l => {
          if (l.id === id) {
            return { ...l, order: newOrder };
          }
          // If moving layer down
          if (layer.order < newOrder) {
            if (l.order > layer.order && l.order <= newOrder) {
              return { ...l, order: l.order - 1 };
            }
          }
          // If moving layer up
          else if (layer.order > newOrder) {
            if (l.order >= newOrder && l.order < layer.order) {
              return { ...l, order: l.order + 1 };
            }
          }
          return l;
        })
        .sort((a, b) => a.order - b.order);

      // Update all affected layers in the database
      for (const l of reorderedLayers) {
        if (l.order !== currentLayers.find(cl => cl.id === l.id)?.order) {
          await updateLayerById(l.id, { order: l.order });
        }
      }

      set({ layers: reorderedLayers, isLoading: false });
    } catch (error) {
      console.error('Reorder error:', error);
      set({ error: 'Failed to reorder layer', isLoading: false });
    }
  },

  toggleLayerVisibility: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const layer = get().layers.find(l => l.id === id);
      if (!layer) {
        throw new Error('Layer not found');
      }

      const newVisibility = !layer.visible;
      await updateLayerById(id, { visible: newVisibility });
      set((state) => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, visible: newVisibility } as Layer : layer
        ),
        isLoading: false
      }));
    } catch {
      set({ error: 'Failed to toggle layer visibility', isLoading: false });
    }
  }
}));
