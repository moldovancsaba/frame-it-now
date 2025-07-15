import React from 'react';

interface PreviewFrameProps {
  previewSize: { width: number; height: number };
  setPreviewSize: (size: { width: number; height: number }) => void;
}

// Constants for minimum dimensions
const MIN_PREVIEW_WIDTH = 320; // Minimum reasonable width for preview
const MIN_PREVIEW_HEIGHT = 240; // Minimum reasonable height for preview
const UI_ELEMENTS_HEIGHT = 100; // Height of UI elements to account for

/**
 * Handles frame load errors by setting sensible default dimensions
 * when the frame dimensions cannot be properly loaded.
 * 
 * @param setPreviewSize - Function to update the preview size state
 * @returns void - This function only performs side effects: updates size state and logs error
 */
const handleFrameLoadError = (
  setPreviewSize: (size: { width: number; height: number }) => void
): void => {
  setPreviewSize({
    width: Math.min(640, window.innerWidth),
    height: Math.min(480, window.innerHeight - UI_ELEMENTS_HEIGHT)
  });
  console.error('Failed to load frame dimensions, using defaults');
};

/**
 * Enforces minimum size constraints to prevent invalid dimensions by ensuring
 * the width and height meet minimum requirements.
 * 
 * @param size - Object containing width and height dimensions
 * @returns Object with the same shape as input, but with dimensions adjusted to meet minimum requirements
 */
const enforceMinimumSize = (
  size: { width: number; height: number }
): { width: number; height: number } => {
  return {
    width: Math.max(size.width, MIN_PREVIEW_WIDTH),
    height: Math.max(size.height, MIN_PREVIEW_HEIGHT)
  };
};

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ previewSize, setPreviewSize }) => {
  // Apply size constraints to ensure valid dimensions
  const safePreviewSize = enforceMinimumSize(previewSize);

  return (
    <div
      className="preview-frame"
      style={{
        width: `${safePreviewSize.width}px`,
        height: `${safePreviewSize.height}px`
      }}
      onError={() => handleFrameLoadError(setPreviewSize)}
    >
      {/* Frame content goes here */}
    </div>
  );
};
