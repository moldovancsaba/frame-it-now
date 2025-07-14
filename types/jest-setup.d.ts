declare global {
  interface Window {
    HTMLCanvasElement: typeof HTMLCanvasElement;
    HTMLVideoElement: typeof HTMLVideoElement;
    performance: Performance;
    URL: typeof URL;
  }

  interface Navigator {
    mediaDevices: {
      getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
    };
  }

// Canvas context interface
interface CanvasRenderingContext2D {
  filter: string;
getFilter: () => string;
setFilter: (value: string) => void;
}

  // Canvas context interface
  interface MockCanvasRenderingContext2D {
    canvas: any;
    filter: string;
    clearRect: jest.Mock;
    drawImage: jest.Mock;
    fillRect: jest.Mock;
    getImageData: jest.Mock;
    putImageData: jest.Mock;
  }

  // Mock canvas interface
  interface MockCanvas {
    width: number;
    height: number;
    style: Record<string, any>;
    getContext(contextId: string): MockCanvasRenderingContext2D | null;
    toDataURL(): string;
  }

  // Video element interface
  interface VideoMock {
    videoWidth: number;
    videoHeight: number;
    play(): Promise<void>;
    pause: jest.Mock;
  }

  // Image element interface
  interface MockImage {
    onload?: () => void;
  }

  // Extend the HTMLCanvasElement
  interface HTMLCanvasElement extends MockCanvas {}
  interface HTMLVideoElement extends VideoMock {}
  interface Image extends MockImage {}

  // Extend the jest namespace
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockReturnValue(value: T): Mock<T, Y>;
    }
  }
}

export {};
