import React from 'react';

interface FullscreenButtonProps {
  onClick: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-[18px] right-[18px] btn btn-primary bg-opacity-90 backdrop-blur-sm z-10"
    >
      Fullscreen
    </button>
  );
};

export default FullscreenButton;
