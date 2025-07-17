import React from 'react';
import Image from 'next/image';

interface OverlayGuideProps {
  src?: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Renders an SVG guide overlay for photo composition
 * Can either use a built-in grid or a custom SVG from URL
 */
export default function OverlayGuide({ src, width, height, className }: OverlayGuideProps): JSX.Element {
  if (src) {
    return (
      <div className={className}>
        <Image
          src={src}
          alt="composition guide"
          width={width}
          height={height}
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }

  // Default grid guide if no SVG provided
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rule of thirds grid */}
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1">
        <line x1={width/3} y1={0} x2={width/3} y2={height} />
        <line x1={width*2/3} y1={0} x2={width*2/3} y2={height} />
        <line x1={0} y1={height/3} x2={width} y2={height/3} />
        <line x1={0} y1={height*2/3} x2={width} y2={height*2/3} />
      </g>
    </svg>
  );
}
