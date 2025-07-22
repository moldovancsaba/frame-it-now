import { create } from 'zustand';
import type { IComposition } from '../types/composition';

interface ICompositionStore {
  id?: string;
  aspectRatio: {
    width: number;
    height: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchComposition: () => Promise<void>;
  setAspectRatio: (width: number, height: number) => Promise<void>;
}

export const useCompositionStore = create<ICompositionStore>((set) => ({
  aspectRatio: {
    width: 16,
    height: 9
  },
  isLoading: false,
  error: null,
  id: undefined,

  fetchComposition: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/composition');
      if (!response.ok) {
        throw new Error('Failed to fetch composition');
      }
      const data = await response.json() as IComposition;
      set({ 
        aspectRatio: data.aspectRatio,
        id: data.id,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch composition',
        isLoading: false 
      });
    }
  },

  setAspectRatio: async (width: number, height: number) => {
    const currentState = useCompositionStore.getState();
    set({ aspectRatio: { width, height }, error: null });

    try {
      const method = currentState.id ? 'PUT' : 'POST';
      const response = await fetch('/api/composition', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentState.id,
          aspectRatio: { width, height }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save composition');
      }

      const data = await response.json();
      if (method === 'POST') {
        set({ id: data.id });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save composition' });
    }
  }
}));
