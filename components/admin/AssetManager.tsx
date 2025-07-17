import React, { useState } from 'react';
import { Frame, Guide, Background, AssetType } from '../../types/admin';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface AssetManagerProps {
  type: AssetType;
  assets: (Frame | Guide | Background)[];
  onAddAsset?: (name: string, url: string) => Promise<void>;
  onCreateBackground?: (name: string, style: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelect: (id: string | null) => Promise<void>;
  onToggleActive: (id: string) => Promise<void>;
  onSuccess?: (asset: { type: AssetType; name: string; url?: string; style?: string }) => void;
  onError?: (error: unknown) => void;
}

export default function AssetManager({
  type,
  assets,
  onAddAsset,
  onCreateBackground,
  onDelete,
  onSelect,
  onToggleActive,
  onSuccess,
  onError,
}: AssetManagerProps): JSX.Element {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateAssetUrl = (url: string): ValidationResult => {
    // Basic validation - just make sure it's a URL
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsValidating(true);

    // Clear all previous states
    const clearStates = (): void => {
      setUrlError(null);
      setNameError(null);
      setStyleError(null);
      setSuccessMessage(null);
    };
    
    clearStates();

    try {
      // Common validation
      if (!name?.trim()) {
        setNameError('Name is required');
        return;
      }

      if (type === 'background') {
        // Background-specific validation
        if (!style?.trim()) {
          setStyleError('Style is required');
          return;
        }
        if (!onCreateBackground) {
          throw new Error('Background creation is not available');
        }

        // Create background with trimmed values
        await onCreateBackground(name.trim(), style.trim());
      } else {
        // Asset-specific validation
        if (!url?.trim()) {
          setUrlError('URL is required');
          return;
        }
        if (!onAddAsset) {
          throw new Error('Asset creation is not available');
        }

        // Validate URL
        const validationResult = validateAssetUrl(url.trim());
        if (!validationResult.isValid) {
          setUrlError(validationResult.error || 'Invalid URL');
          return;
        }

        // Create asset with trimmed values
        await onAddAsset(name.trim(), url.trim());
      }

      // Success handling
      const assetDetails = {
        type,
        name: name.trim(),
        url: type !== 'background' ? url.trim() : undefined,
        style: type === 'background' ? style.trim() : undefined
      };

      setSuccessMessage(`Successfully created ${type}: ${name}`);
      onSuccess?.(assetDetails);

      // Reset form
      setName('');
      setUrl('');
      setStyle('');
      clearStates();
    } catch (error) {
      // Error handling
      console.error('Error creating asset:', {
        type,
        name,
        url: type !== 'background' ? url : undefined,
        style: type === 'background' ? style : undefined,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : 'Unknown error'
      });

      // Set appropriate error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(error);

      if (type === 'background') {
        setStyleError(errorMessage);
      } else {
        setUrlError(errorMessage);
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 bg-white p-4 rounded-lg shadow">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
            <ErrorMessage error={nameError} />
        </div>

        {type === 'background' ? (
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">
              CSS Background Style
            </label>
            <textarea
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., linear-gradient(to right, #00ff00, #0000ff)"
              required
            />
            <ErrorMessage error={styleError} />
          </div>
        ) : (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              {type === 'frame' ? 'PNG URL' : 'SVG URL'}
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={`Enter URL to ${type === 'frame' ? 'PNG' : 'SVG'} image`}
              required
              disabled={isValidating}
            />
            {urlError ? (
              <p className="mt-1 text-sm text-red-600">{urlError}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                URL must link to a {type === 'frame' ? 'PNG' : 'SVG'} image
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isValidating ? (
            <span className="inline-flex items-center">
              <LoadingSpinner />
              <span className="ml-2">Validating...</span>
            </span>
          ) : (
            `Add ${type}`
          )}
        </button>
      </form>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Existing {type}s</h3>
        <div className="space-y-4">
          {assets.map((asset) => (
            <div
              key={asset._id.toString()}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={asset.isSelected}
                  onChange={() => { void onSelect(asset.isSelected ? null : asset._id.toString()); }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="flex flex-col">
                  <span className={`font-medium ${asset.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {asset.name}
                  </span>
                  {'url' in asset && (
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View Resource
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { void onToggleActive(asset._id.toString()); }}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    asset.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {asset.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => { void onDelete(asset._id.toString()); }}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {assets.length === 0 && (
            <p className="text-gray-500 text-center py-4">No {type}s added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
