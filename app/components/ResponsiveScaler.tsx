'use client';

import { ReactNode, useEffect, useState } from 'react';
import { calculateOptimalDimensions } from '../../utils/calculateOptimalDimensions';

/**
 * Props definition for the ResponsiveScaler component.
 *
 * @prop children - Any ReactNode elements to be scaled,
 *                  allowing for flexibility in scaling content.
 * @prop aspectRatio - The desired aspect ratio of the content. 
 *                     This value drives the scaling and must be preserved.
 */
interface ResponsiveScalerProps {
  children: ReactNode;
  aspectRatio: number;
}

/**
 * Represents the calculated display dimensions, including scale.
 * This structure encodes both the size and the scaling factor
 * applied to the content to maintain responsiveness.
 *
 * Comprised of:
 * - width: Calculated dimension after aspect ratio scaling
 * - height: Matches the width based on aspect ratio
 * - scale: The factor that further scales the content to fit the viewport
 */
interface Dimensions {
  width: number;
  height: number;
  scale: number;
}

/**
 * Calculates the dimensions and scale factor for responsive frame scaling.
 * 
 * The calculation follows these steps:
 * 1. Calculate optimal frame dimensions using screen constraints
 * 2. Ensure the frame never exceeds screen dimensions while maintaining aspect ratio
 * 3. Compute scale factor to fill viewport while preserving proportions
 *
 * @param viewportWidth - Current viewport width in pixels
 * @param viewportHeight - Current viewport height in pixels
 * @param aspectRatio - Desired aspect ratio (width/height)
 * @returns Dimensions object with width, height, and scale factor
 */
// Type guard for dimensions
function isValidDimension(value: number): value is number {
  return typeof value === 'number' && value > 0 && isFinite(value);
}

// Type guard for aspect ratio
function isValidAspectRatio(value: number): value is number {
  return typeof value === 'number' && value > 0 && isFinite(value);
}

/**
 * Fallback dimensions used when input validation fails.
 *
 * These hardcoded dimensions maintain a 4:3 aspect ratio (800x600)
 * with a neutral scale of 1 to ensure content is never completely
 * undisplayable, supporting developers in diagnosing issues easily.
 */
const FALLBACK_DIMENSIONS: Dimensions = {
  width: 800,
  height: 600,
  scale: 1
};

const calculateDimensions = (
  viewportWidth: number,
  viewportHeight: number,
  aspectRatio: number
): Dimensions => {
/**
 * Input validation steps: ensure that provided dimensions
 * and the aspect ratio are mathematically valid and usable.
 *
 * This pre-empts logical errors and provides fail-safes for the UI.
 * - Invalid dimensions include zeros, negatives, infinities, or non-numbers
 * - A fallback strategy maintains operational integrity
 */
  if (!isValidDimension(viewportWidth) || !isValidDimension(viewportHeight)) {
    console.warn('Invalid viewport dimensions; using fallback values.');
    return FALLBACK_DIMENSIONS;
  }

  if (!isValidAspectRatio(aspectRatio)) {
    console.warn('Invalid aspect ratio; using fallback values.');
    return FALLBACK_DIMENSIONS;
  }

/**
 * Calculate initial container dimensions from the viewport size:
 * - Sets width based on maximum available space
 * - Computes height using the given aspect ratio 
 */
  const baseWidth = viewportWidth;
  const baseHeight = baseWidth / aspectRatio;
  
/**
 * Invoke the optimal dimension calculator to adjust base dimensions.
 * This call ensures dimensions do not overflow the available viewport
 * space, adhering to screen limitations while preserving the ratio.
 */
  const { width, height } = calculateOptimalDimensions(
    baseWidth,
    baseHeight,
    viewportWidth,
    viewportHeight
  );
  
  return { width, height, scale: 1 };
};

/**
 * A component that scales its children to fit the viewport while maintaining aspect ratio.
 * Uses CSS transforms for smooth hardware-accelerated scaling.
 *
 * Key features:
 * - Maintains specified aspect ratio across all viewport sizes
 * - Dynamically adjusts on viewport resize
 * - Uses hardware acceleration for smooth performance
 * - Handles both portrait and landscape orientations
 *
 * @param children - Content to be scaled
 * @param aspectRatio - Desired aspect ratio (width/height)
 */
export default function ResponsiveScaler({ children, aspectRatio }: ResponsiveScalerProps): JSX.Element {
  const [dimensions, setDimensions] = useState<Dimensions>({ 
    width: 0, 
    height: 0, 
    scale: 1 
  });

  useEffect(() => {
    const updateDimensions = () => {
      const newDimensions = calculateDimensions(
        window.innerWidth,
        window.innerHeight,
        aspectRatio
      );
      setDimensions(newDimensions);
    };

    // Initial calculation
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, [aspectRatio]);
  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          position: 'relative',
          transition: 'width 0.3s ease, height 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
