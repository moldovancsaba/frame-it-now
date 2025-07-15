/**
 * Constants for UI elements that affect available screen space
 */
export const UI_ELEMENTS_HEIGHT = 150; // Height in pixels of UI elements that reduce available space

/**
 * Gets the available screen space accounting for UI elements
 * @returns {Object} Available width and height in pixels
 */
export const getAvailableScreenSpace = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight - UI_ELEMENTS_HEIGHT;
  
  // Calculate 60% of the smaller dimension to maintain aspect ratio
  const maxDimension = Math.min(screenWidth, screenHeight) * 0.6;
  
  return {
    width: maxDimension,
    height: maxDimension
  };
};

/**
 * Calculates preview dimensions that fit within available screen space while preserving aspect ratio
 * @param frame - HTML image element containing the frame/photo to size
 * @param screen - Available screen dimensions
 * @returns {Object} Calculated width and height that maintains aspect ratio
 */
export const calculatePreviewSize = (frame: HTMLImageElement, screen: {width: number, height: number}) => {
  const frameAspect = frame.naturalWidth / frame.naturalHeight;
  const screenAspect = screen.width / screen.height;
  
  // Use 80% of available space
  const maxWidth = screen.width * 0.8;
  const maxHeight = screen.height * 0.8;
  
  let width, height;
  if (frameAspect > screenAspect) {
    width = maxWidth;
    height = width / frameAspect;
  } else {
    height = maxHeight;
    width = height * frameAspect;
  }
  
  return { width, height };
};

/**
 * Calculates positions for UI elements relative to the preview size
 * @param previewSize - Width and height of the preview container
 * @returns Object containing position data for frame, guide, and buttons
 */
export const calculateUIPositions = (previewSize: {width: number, height: number}) => {
  return {
    frame: {
      width: '100%',
      height: '100%'
    },
    guide: {
      width: '80%', // Reduced size for better visibility
      height: '80%',
      top: '10%',
      left: '10%'
    },
    buttons: {
      bottom: 20,
      width: previewSize.width
    }
  };
};
