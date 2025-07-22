import React, { useEffect, useState } from 'react';

/**
 * ResponsiveScaler Component
 * 
 * A utility component that scales its children based on viewport dimensions and a target aspect ratio.
 * The component ensures content maintains visual consistency across different screen sizes and orientations.
 * 
 * @param {React.ReactNode} children - The content to be scaled
 * @param {number} aspectRatio - Target aspect ratio (width / height) for the content
 * 
 * Features:
 * - Dynamically calculates viewport dimensions using React hooks
 * - Determines device orientation (landscape vs portrait)
 * - Computes optimal scaling based on provided aspect ratio
 * - Applies CSS transforms for smooth scaling
 */
const ResponsiveScaler: React.FC<{
  children: React.ReactNode;
  aspectRatio: number;
}> = ({ children, aspectRatio }) => {
  // State for viewport dimensions and scaling
  const [scale, setScale] = useState(1);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Calculate scale and update dimensions on viewport changes
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const currentAspectRatio = width / height;
      
      // Determine orientation
      const isLandscape = width > height;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
      
      // Calculate optimal scale based on aspect ratio and viewport
      let newScale;
      if (currentAspectRatio > aspectRatio) {
        // Viewport is wider than target - scale based on height
        newScale = height / (width / aspectRatio);
      } else {
        // Viewport is taller than target - scale based on width
        newScale = width / (height * aspectRatio);
      }
      
      setScale(newScale);
      setDimensions({ width, height });
    };

    // Initial calculation
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [aspectRatio]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: `${dimensions.width}px`,
          height: `${dimensions.height / aspectRatio}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ResponsiveScaler;
