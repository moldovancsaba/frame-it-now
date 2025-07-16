import { useEffect, useRef, useState } from "react";

interface Dimensions {
  width: number;
  height: number;
}

interface UseCameraOptions {
  facingMode?: "user" | "environment";
  dimensions?: Dimensions;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  initializationStatus: {
    state: "initializing" | "ready" | "error";
    message?: string;
  };
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  retryCamera: () => Promise<void>;
}

export const useCamera = ({ facingMode = "user", dimensions }: UseCameraOptions = {}): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [initializationStatus, setInitializationStatus] = useState<{
    state: "initializing" | "ready" | "error";
    message?: string;
  }>({ state: "initializing" });

  const getVideoConstraints = () => ({
    video: {
      facingMode,
      aspectRatio: 1, // Force 1:1 aspect ratio
      width: { ideal: dimensions?.width || window.innerWidth },
      height: { ideal: dimensions?.width || window.innerWidth } // Use width for height to maintain 1:1
    }
  });

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setInitializationStatus({ state: "initializing" });
  };

  const startCamera = async () => {
    try {
      setInitializationStatus({ state: "initializing" });
      stopCamera();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia(getVideoConstraints()).catch(err => {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          throw new Error("Camera access denied. Please grant permission to use your camera.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          throw new Error("No camera device found. Please check your hardware.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          throw new Error("Camera is in use by another application.");
        }
        throw err;
      });

      stopCamera();
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setInitializationStatus({ state: "ready" });
        };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start camera");
      const errorMessage = error.message || "Camera initialization failed";
      setInitializationStatus({ state: "error", message: errorMessage });
      console.error("Camera initialization error:", error);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      setInitializationStatus({ state: "initializing" });
    };
  }, [facingMode, dimensions?.width, dimensions?.height]);

  const retryCamera = async () => {
    await stopCamera();
    await startCamera();
  };

  return {
    videoRef,
    initializationStatus,
    startCamera,
    stopCamera,
    retryCamera,
  };
};

export default useCamera;
