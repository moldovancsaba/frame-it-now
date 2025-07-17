interface FrameDimensions {
  width: number;
  height: number;
}

export const getAvailableScreenSpace = (frameAspectRatio?: number): FrameDimensions => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const padding = 40; // Add some padding from the edges
  const availableWidth = screenWidth - padding * 2;
  const availableHeight = screenHeight - padding * 2;

  // If no frame aspect ratio provided, default to 1:1
  const aspectRatio = frameAspectRatio || 1;

  let width: number;
  let height: number;

  if (availableWidth / aspectRatio <= availableHeight) {
    // Width is the limiting factor
    width = availableWidth;
    height = availableWidth / aspectRatio;
  } else {
    // Height is the limiting factor
    height = availableHeight;
    width = availableHeight * aspectRatio;
  }

  // Ensure dimensions don't exceed available space
  return {
    width: Math.min(width, availableWidth),
    height: Math.min(height, availableHeight)
  };
};
