'use client';

import { useLayersStore } from '../store/layers';
import { useCompositionStore } from '../store/composition';
import type { LayerType, ScalingMode } from '../types/layers';
import { useState, useEffect } from 'react';

export default function LayersPage(): JSX.Element {
  const { 
    layers, 
    addLayer, 
    removeLayer, 
    reorderLayer, 
    toggleLayerVisibility,
    updateLayer, 
    fetchLayers,
    isLoading,
    error
  } = useLayersStore();

  const { 
    aspectRatio, 
    setAspectRatio, 
    fetchComposition,
    isLoading: isCompositionLoading,
    error: compositionError 
  } = useCompositionStore();

  useEffect(() => {
    fetchComposition();
  }, [fetchComposition]);
  const [newLayerType, setNewLayerType] = useState<LayerType>('text');

  const handleLayerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setNewLayerType(e.target.value as LayerType);
  };

  const handleToggleVisibility = (id: string): void => {
    toggleLayerVisibility(id);
  };

  const handleScalingChange = (id: string, scaling: ScalingMode): void => {
    updateLayer(id, { scaling });
  };

  const handleAspectRatioChange = async (ratio: string): Promise<void> => {
    if (ratio === 'custom') {
      // Don't change anything when switching to custom, just enable custom inputs
      return;
    }
    // For preset ratios, update both the store and disable custom inputs
    const [width, height] = ratio.split(':').map(Number);
    await setAspectRatio(width, height);
  };

  const handleCustomAspectRatioChange = async (width: number, height: number): Promise<void> => {
    await setAspectRatio(width || 1, height || 1);
  };

  const handleMoveUp = (id: string, currentOrder: number): void => {
    reorderLayer(id, Math.max(0, currentOrder - 1));
  };

  const handleMoveDown = (id: string, currentOrder: number): void => {
    reorderLayer(id, currentOrder + 1);
  };

  const handleRemove = (id: string): void => {
    removeLayer(id);
  };

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
          size: { width: 100, height: 100 },
          scaling: 'fill' as const
        };
        layer = imageLayer;
        break;
      }
        
      case 'camera': {
        const cameraLayer = {
          ...baseLayer,
          type: 'camera' as const,
          scaling: 'fill' as const
        };
        layer = cameraLayer;
        break;
      }
    }

    addLayer(layer);
  };

  if (isLoading || isCompositionLoading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (error || compositionError) {
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
      {/* Aspect Ratio Controls */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Composition Settings</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Preset Ratios:</label>
            <select
              value={`${aspectRatio.width}:${aspectRatio.height}`}
              onChange={(e) => handleAspectRatioChange(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
              <option value="9:16">9:16</option>
              <option value="3:4">3:4</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Custom Ratio:</label>
            <input
              type="number"
              value={aspectRatio.width}
              onChange={(e) => handleCustomAspectRatioChange(parseInt(e.target.value), aspectRatio.height)}
              min="1"
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '70px'
              }}
            />
            <span>:</span>
            <input
              type="number"
              value={aspectRatio.height}
              onChange={(e) => handleCustomAspectRatioChange(aspectRatio.width, parseInt(e.target.value))}
              min="1"
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '70px'
              }}
            />
          </div>
        </div>
      </div>
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
          onChange={handleLayerTypeChange}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ minWidth: '80px' }}>{layer.type}</span>
              {(layer.type === 'image' || layer.type === 'camera') && (
                <select
                  value={layer.scaling || 'none'}
                  onChange={(e) => handleScalingChange(layer.id, e.target.value as ScalingMode)}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '12px'
                  }}
                >
                  <option value="fill">Fill</option>
                  <option value="fit">Fit</option>
                  <option value="none">Original</option>
                </select>
              )}
            </div>
            <button 
              onClick={() => handleToggleVisibility(layer.id)}
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
              onClick={() => handleMoveUp(layer.id, layer.order)}
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
              onClick={() => handleMoveDown(layer.id, layer.order)}
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
              onClick={() => handleRemove(layer.id)}
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
