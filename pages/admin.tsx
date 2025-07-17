import { useState, useEffect, ReactElement } from 'react';
import AssetManager from '../components/admin/AssetManager';
import { Frame, Guide, Background } from '../types/admin';

interface AssetsState {
  frames: Frame[];
  guides: Guide[];
  backgrounds: Background[];
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{ field: string; message: string }>;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export default function AdminPage(): ReactElement {
  const [assets, setAssets] = useState<AssetsState>({
    frames: [],
    guides: [],
    backgrounds: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async (): Promise<void> => {
      try {
        const [frames, guides, backgrounds] = await Promise.all([
          fetch('/api/admin/assets/frame/list').then(res => res.json() as Promise<ApiResponse<Frame[]>>),
          fetch('/api/admin/assets/guide/list').then(res => res.json() as Promise<ApiResponse<Guide[]>>),
          fetch('/api/admin/assets/background/list').then(res => res.json() as Promise<ApiResponse<Background[]>>),
        ]);

        setAssets({
          frames: frames.success ? frames.data : [],
          guides: guides.success ? guides.data : [],
          backgrounds: backgrounds.success ? backgrounds.data : [],
        });
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets. Please try refreshing the page.');
      }
    };

    void fetchAssets();
  }, []);

  const handleAddAsset = async (type: 'frame' | 'guide', name: string, url: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/assets/${type}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url }),
      });

      const result = await response.json() as ApiResponse<Frame | Guide>;
      
      if (!result.success) {
        const details = 'details' in result ? 
          result.details?.map(err => `${err.field}: ${err.message}`).join(', ') : 
          result.error;
        throw new Error(details || result.error);
      }

      const listResponse = await fetch(`/api/admin/assets/${type}/list`);
      const listResult = await listResponse.json() as ApiResponse<Frame[] | Guide[]>;
      
      if (listResult.success) {
        setAssets(prev => ({
          ...prev,
          [type + 's']: listResult.data,
        }));
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Error adding ${type}:`, err);
      setError(`Failed to add ${type}: ${error}`);
    }
  };

  const handleCreateBackground = async (name: string, style: string): Promise<void> => {
    try {
      const response = await fetch('/api/admin/assets/background/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, style }),
      });

      const result = await response.json() as ApiResponse<Background>;
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const listResponse = await fetch('/api/admin/assets/background/list');
      const listResult = await listResponse.json() as ApiResponse<Background[]>;
      
      if (listResult.success) {
        setAssets(prev => ({
          ...prev,
          backgrounds: listResult.data,
        }));
      }
    } catch (err) {
      console.error('Error creating background:', err);
      setError('Failed to create background. Please try again.');
    }
  };

  const handleDelete = async (type: 'frame' | 'guide' | 'background', id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/assets/${type}/delete?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json() as ApiResponse<void>;
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setAssets(prev => ({
        ...prev,
        [type + 's']: prev[type + 's' as keyof AssetsState].filter(
          asset => asset._id.toString() !== id
        ),
      }));
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(`Failed to delete ${type}. Please try again.`);
    }
  };

  const handleSelect = async (type: 'frame' | 'guide' | 'background', id: string | null): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/assets/${type}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json() as ApiResponse<void>;
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setAssets(prev => ({
        ...prev,
        [type + 's']: prev[type + 's' as keyof AssetsState].map(asset => ({
          ...asset,
          isSelected: asset._id.toString() === id
        })),
      }));
    } catch (err) {
      console.error(`Error selecting ${type}:`, err);
      setError(`Failed to update ${type} selection. Please try again.`);
    }
  };

  const handleToggleActive = async (type: 'frame' | 'guide' | 'background', id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/assets/${type}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json() as ApiResponse<void>;
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setAssets(prev => ({
        ...prev,
        [type + 's']: prev[type + 's' as keyof AssetsState].map(asset => {
          if (asset._id.toString() === id) {
            return { ...asset, isActive: !asset.isActive };
          }
          return asset;
        }),
      }));
    } catch (err) {
      console.error(`Error toggling ${type} active state:`, err);
      setError(`Failed to update ${type} active state. Please try again.`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 overflow-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Asset Management</h1>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-8 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Frames</h2>
          <AssetManager
            type="frame"
            assets={assets.frames}
            onAddAsset={(name, url) => handleAddAsset('frame', name, url)}
            onDelete={id => handleDelete('frame', id)}
            onSelect={id => handleSelect('frame', id)}
            onToggleActive={id => handleToggleActive('frame', id)}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Guides</h2>
          <AssetManager
            type="guide"
            assets={assets.guides}
            onAddAsset={(name, url) => handleAddAsset('guide', name, url)}
            onDelete={id => handleDelete('guide', id)}
            onSelect={id => handleSelect('guide', id)}
            onToggleActive={id => handleToggleActive('guide', id)}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Backgrounds</h2>
          <AssetManager
            type="background"
            assets={assets.backgrounds}
            onCreateBackground={handleCreateBackground}
            onDelete={id => handleDelete('background', id)}
            onSelect={id => handleSelect('background', id)}
            onToggleActive={id => handleToggleActive('background', id)}
          />
        </section>
      </div>
    </div>
  );
}
