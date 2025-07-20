'use client';

import { useEffect, useRef } from 'react';

export default function Page(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect((): (() => void) => {
    let stream: MediaStream | null = null;
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(mediaStream => {
        if (videoRef.current) {
          stream = mediaStream;
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(console.error);

    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      style={{ 
        width: '100%', 
        height: '100vh', 
        objectFit: 'cover' 
      }} 
    />
  );
}
