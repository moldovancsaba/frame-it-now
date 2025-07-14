import React from 'react';

interface OverlayGuideProps {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * OverlayGuide Component
 * Renders an SVG guide overlay for face positioning
 * 
 * @param {number} width - Width of the guide overlay (default: 200)
 * @param {number} height - Height of the guide overlay (default: 200)
 */
export const OverlayGuide: React.FC<OverlayGuideProps> = ({ 
  width = 200, 
  height = 200,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 300 300"
      width={width}
      height={height}
      className={className}
    >
      {/* Face outline */}
      <ellipse 
        cx="150" 
        cy="140" 
        rx="90" 
        ry="110" 
        fill="none" 
        stroke="#20e3b2" 
        strokeWidth="4" 
      />
      {/* Left eye */}
      <ellipse 
        cx="115" 
        cy="120" 
        rx="14" 
        ry="10" 
        fill="#fbc531" 
        stroke="#8c52ff" 
        strokeWidth="2" 
      />
      {/* Right eye */}
      <ellipse 
        cx="185" 
        cy="120" 
        rx="14" 
        ry="10" 
        fill="#fbc531" 
        stroke="#8c52ff" 
        strokeWidth="2" 
      />
      {/* Smile */}
      <path 
        d="M120 185 Q150 220 180 185" 
        stroke="#ff5f7e" 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default OverlayGuide;
