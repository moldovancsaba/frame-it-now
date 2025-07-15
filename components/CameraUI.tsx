import React from 'react';

// Define the possible camera states
export enum CameraState {
  INITIALIZING = 'initializing',
  READY = 'ready',
  CAPTURING = 'capturing',
  ERROR = 'error',
  PROCESSING = 'processing'
}

// Define the error type
export interface CameraError extends Error {
  message: string;
  type: 'device' | 'permission' | 'initialization' | 'unknown';
  retry?: () => Promise<void>;
}

/**
 * Visual indicator for camera status with accessibility support
 */
export const CameraStatusIndicator: React.FC<{state: CameraState}> = ({state}) => {
  const getStatusColor = (): string => {
    switch (state) {
      case CameraState.READY:
        return 'bg-green-500';
      case CameraState.ERROR:
        return 'bg-red-500';
      case CameraState.CAPTURING:
      case CameraState.PROCESSING:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (): string => {
    switch (state) {
      case CameraState.INITIALIZING:
        return 'Camera initializing...';
      case CameraState.READY:
        return 'Camera ready';
      case CameraState.CAPTURING:
        return 'Taking photo...';
      case CameraState.PROCESSING:
        return 'Processing photo...';
      case CameraState.ERROR:
        return 'Camera error';
      default:
        return 'Unknown state';
    }
  };

  return (
    <div
      className="flex items-center space-x-2"
      role="status"
      aria-live="polite"
    >
      <div
        className={`h-3 w-3 rounded-full ${getStatusColor()}`}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-600">
        {getStatusText()}
      </span>
    </div>
  );
};

/**
 * Camera control button with state management
 */
export const CameraButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
  state: CameraState;
}> = ({ disabled, onClick, state }) => {
  const getButtonText = (): string => {
    switch (state) {
      case CameraState.CAPTURING:
        return 'Capturing...';
      case CameraState.PROCESSING:
        return 'Processing...';
      case CameraState.READY:
        return 'Take Photo';
      default:
        return 'Camera Not Ready';
    }
  };

  const getButtonClass = (): string => {
    const baseClass = 'btn transition-colors duration-200';
    if (disabled) return `${baseClass} btn-disabled opacity-50 cursor-not-allowed`;
    if (state === CameraState.READY) return `${baseClass} btn-primary`;
    return `${baseClass} btn-secondary`;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClass()}
      aria-busy={state === CameraState.CAPTURING || state === CameraState.PROCESSING}
    >
      {state === CameraState.PROCESSING && (
        <span className="loading-spinner mr-2" aria-hidden="true" />
      )}
      {getButtonText()}
    </button>
  );
};

/**
 * Tooltip component for displaying camera errors
 */
export const ErrorTooltip: React.FC<{error: CameraError}> = ({ error }) => {
  return (
    <div
      role="alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      aria-live="polite"
    >
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error.message}</span>
      <span className="block text-sm mt-1">Error type: {error.type}</span>
      {error.retry && (
        <button
          onClick={() => { if (error.retry) void error.retry(); }}
          className="mt-2 text-red-700 underline hover:text-red-800"
        >
          Retry
        </button>
      )}
    </div>
  );
};
