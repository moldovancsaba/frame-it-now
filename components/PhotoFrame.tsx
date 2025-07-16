import React, { forwardRef, CSSProperties, useEffect } from "react";
import { getAvailableScreenSpace } from "../utils/previewSize";
import Image, { ImageProps } from "next/image";

type BaseProps = Partial<Omit<ImageProps, "alt" | "onError">>;

interface PhotoFrameProps extends BaseProps {
  ref?: React.Ref<HTMLImageElement>;
  src: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  onError?: (error: Error) => void;
  layout?: "fixed" | "fill" | "responsive" | "intrinsic";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  isReady?: boolean;
  onFrameDimensionsChange?: (dimensions: { width: number; height: number }) => void;
}

const PhotoFrame = forwardRef<HTMLImageElement, PhotoFrameProps>(function PhotoFrame(props, ref) {
  const {
    src,
    className = "",
    style,
    onError,
    isReady = true,
    onFrameDimensionsChange,
    width,
    height,
    ...otherProps
  } = props;

  const handleError = (): void => {
    if (onError) {
      const error = new Error("Image loading failed");
      onError(error);
    }
  };

  // Update dimensions when screen size changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateDimensions = () => {
        const dimensions = getAvailableScreenSpace();
        onFrameDimensionsChange?.(dimensions);
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, [onFrameDimensionsChange]);

  const imageClasses = [
    "photo-frame-overlay",
    !isReady && "photo-frame-hidden",
    className
  ].filter(Boolean).join(" ");

  const dimensions = getAvailableScreenSpace();

  return (
    <Image
      ref={ref}
      src={src}
      width={width || dimensions.width}
      height={height || dimensions.height}
      className={imageClasses}
      style={style}
      alt="Photo frame overlay"
      onError={handleError}
      quality={75}
      priority={true}
      unoptimized={true}
      {...otherProps}
    />
  );
});

export default PhotoFrame;
