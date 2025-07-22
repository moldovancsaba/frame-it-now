/**
 * Represents the optimal dimensions for a container that needs to maintain aspect ratio
 * while fitting within screen constraints.
 *
 * The width and height values are calculated to:
 * 1. Preserve the original aspect ratio of the content
 * 2. Maximize the usable space within the screen boundaries
 * 3. Prevent any dimension from exceeding screen limits
 */
export interface OptimalDimensions {
  width: number;   // The calculated optimal width in pixels
  height: number;  // The calculated optimal height in pixels
}

/**
 * Type guard that ensures a dimension value is valid for calculations.
 * 
 * A valid dimension must be:
 * - A finite number (not NaN or Infinity)
 * - Greater than 0 (negative or zero dimensions are meaningless)
 * - Actually a number (not a string or other type)
 *
 * @param value - The dimension value to validate
 * @returns true if the value is a valid positive number
 */
function isValidDimension(value: number): value is number {
  return typeof value === 'number' && value > 0 && isFinite(value);
}

/**
 * Default dimensions used as a safety fallback when calculations cannot be performed.
 * 
 * The 4:3 aspect ratio (800x600) is chosen because:
 * 1. It's a historically common display ratio
 * 2. Works reasonably well for both landscape and portrait content
 * 3. Provides adequate space for most content types
 */
const FALLBACK_DIMENSIONS: OptimalDimensions = {
  width: 800,   // Conservative width that works well across devices
  height: 600   // Maintains 4:3 aspect ratio with the fallback width
};

/**
 * Calculates the optimal dimensions for a container while preserving aspect ratio
 * and maximizing screen space utilization.
 *
 * Mathematical Principles:
 * 1. Aspect Ratio Preservation: 
 *    - Original ratio (R) = containerWidth / containerHeight
 *    - This ratio must be maintained in the final dimensions
 *    - For any new width (W), height (H) must satisfy: W/H = R
 *
 * 2. Screen Space Optimization:
 *    - Compare available space in width vs height direction
 *    - Choose the dimension that has less available space as the constraint
 *    - This prevents overflow while maximizing usage of available space
 *
 * 3. Scaling Logic:
 *    - If width is constrained: 
 *      - Use full screen width
 *      - Calculate height using aspect ratio: H = W/R
 *    - If height is constrained:
 *      - Use full screen height
 *      - Calculate width using aspect ratio: W = H*R
 *
 * Edge Cases Handled:
 * - Invalid dimensions (negative, zero, NaN, Infinity)
 * - Zero container height (avoid division by zero)
 * - Screen smaller than container in both dimensions
 * 
 * @param containerWidth - Original width of the container
 * @param containerHeight - Original height of the container
 * @param screenWidth - Available width in the screen
 * @param screenHeight - Available height in the screen
 * @returns OptimalDimensions object with calculated width and height
 * @throws Error if input dimensions are invalid
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  screenWidth: number,
  screenHeight: number
): OptimalDimensions {
if (!isValidDimension(containerWidth) || !isValidDimension(containerHeight)) {
    throw new Error('Container dimensions must be positive numbers.');
  }

  if (!isValidDimension(screenWidth) || !isValidDimension(screenHeight)) {
    throw new Error('Screen dimensions must be positive numbers.');
  }

  if (containerHeight === 0) {
    console.warn('Container height is zero; using fallback dimensions.');
    return FALLBACK_DIMENSIONS;
  }

  const aspectRatio = containerWidth / containerHeight;
  
  // Calculate dimensions that would fit the screen in both directions
  let width = screenWidth;
  let height = width / aspectRatio;
  
  // If height exceeds screen height, constrain by height instead
  if (height > screenHeight) {
    height = screenHeight;
    width = height * aspectRatio;
  }
  
  return { width, height };
}

