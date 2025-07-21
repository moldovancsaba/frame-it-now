'use client';

import { useLayersStore } from '../store/layers';
import type { LayerType } from '../types/layers';
import { useState, useEffect } from 'react';

export default function LayersPage(): JSX.Element {
  const { 
    layers, 
    addLayer, 
    removeLayer, 
    reorderLayer, 
    toggleLayerVisibility, 
    fetchLayers,
    isLoading,
    error
  } = useLayersStore();
  const [newLayerType, setNewLayerType] = useState<LayerType>('text');

  useEffect(() => {
    fetchLayers();
  }, [fetchLayers]);

  const handleAddLayer = (): void => {
    const baseLayer = {
      order: layers.length,
      visible: true
    } as const;

    let layer;
    
    switch (newLayerType) {
      case 'text': {
        const textLayer = {
          ...baseLayer,
          type: 'text' as const,
          content: 'New Text',
          fontSize: 16,
          color: '#000000',
          position: { x: 0, y: 0 }
        };
        layer = textLayer;
        break;
      }
        
      case 'image': {
        const imageLayer = {
          ...baseLayer,
          type: 'image' as const,
          url: '',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 }
        };
        layer = imageLayer;
        break;
      }
        
      case 'camera': {
        const cameraLayer = {
          ...baseLayer,
          type: 'camera' as const
        };
        layer = cameraLayer;
        break;
      }
    }

    addLayer(layer);
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666'
      }}>
        Loading layers...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#dc3545'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <select
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
          value={newLayerType} 
          onChange={(e) => setNewLayerType(e.target.value as LayerType)}
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="camera">Camera</option>
        </select>
        <button 
          onClick={handleAddLayer}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Layer
        </button>
      </div>

      <div>
        {layers.sort((a, b) => a.order - b.order).map((layer) => (
          <div key={layer.id} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            borderBottom: '1px solid #eee',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <span style={{ minWidth: '80px' }}>{layer.type}</span>
            <button 
              onClick={() => toggleLayerVisibility(layer.id)}
              style={{
                padding: '4px 8px',
                backgroundColor: layer.visible ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                minWidth: '60px'
              }}
            >
              {layer.visible ? 'Hide' : 'Show'}
            </button>
            <button 
              onClick={() => reorderLayer(layer.id, Math.max(0, layer.order - 1))}
              disabled={layer.order === 0}
              style={{
                padding: '4px 8px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: layer.order === 0 ? 'not-allowed' : 'pointer',
                opacity: layer.order === 0 ? 0.5 : 1
              }}
            >
              ↑
            </button>
            <button 
              onClick={() => reorderLayer(layer.id, layer.order + 1)}
              disabled={layer.order === layers.length - 1}
              style={{
                padding: '4px 8px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: layer.order === layers.length - 1 ? 'not-allowed' : 'pointer',
                opacity: layer.order === layers.length - 1 ? 0.5 : 1
              }}
            >
              ↓
            </button>
            <button 
              onClick={() => removeLayer(layer.id)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
