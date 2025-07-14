import React from 'react';

interface ImageControlsProps {
  currentIndex: number;
  totalImages: number;
}

const ImageControls: React.FC<ImageControlsProps> = ({ 
  currentIndex, 
  totalImages 
}) => {
  return (
    <div 
      className="absolute bottom-[18px] right-6 flex items-center gap-3 text-white text-lg opacity-70 z-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm"
    >
      {totalImages > 0 ? (
        <>
          <span>{currentIndex}</span>
          <span>/</span>
          <span>{totalImages}</span>
        </>
      ) : null}
    </div>
  );
};

export default ImageControls;
