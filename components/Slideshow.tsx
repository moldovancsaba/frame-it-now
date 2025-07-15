import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  title: string;
}

interface SlideshowProps {
  photos: Photo[];
  interval?: number;
  showControls?: boolean;
  showDots?: boolean;
}

export const Slideshow: React.FC<SlideshowProps> = ({
  photos,
  interval = 3000,
  showControls = false,
  showDots = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  }, [photos.length]);

  const previousPhoto = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  }, [photos.length]);

  const startTimer = useCallback(() => {
    if (photos.length > 1 && !isPaused) {
      timerRef.current = setInterval(nextPhoto, interval);
    }
  }, [interval, nextPhoto, photos.length, isPaused]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    stopTimer();
  }, [stopTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    startTimer();
  }, [startTimer]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div 
      data-testid="slideshow-container"
      className="slideshow-container relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full">
        <Image
          src={photos[currentIndex].url}
          alt={photos[currentIndex].title}
          width={800}
          height={600}
          className="w-full h-full object-cover"
          unoptimized
        />
        {showControls && (
          <>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full"
              onClick={previousPhoto}
              aria-label="Previous photo"
            >
              ←
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              →
            </button>
          </>
        )}
        {showDots && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to photo ${index + 1}`}
                aria-current={currentIndex === index}
                className={`w-2 h-2 rounded-full ${
                  currentIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
