// Mock canvas render context
class MockCanvasRenderingContext2D {
  private internalFilter: string = '';
  canvas: any;

  constructor(canvas: any) {
    this.canvas = canvas;
  }

  clearRect = jest.fn();
  drawImage = jest.fn();
  fillRect = jest.fn();
  getImageData = jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(100),
    width: 100,
    height: 100
  });
  putImageData = jest.fn();

  get filter(): string {
    return this.internalFilter;
  }

  set filter(value: string) {
    this.internalFilter = value;
  }
}

// Mock canvas element
class MockCanvas {
  width = 0;
  height = 0;
  style = {};
  
  getContext(contextId: string) {
    if (contextId === '2d') {
      return new MockCanvasRenderingContext2D(this);
    }
    return null;
  }

  toDataURL() {
    return 'data:image/png;base64,mockImageData';
  }
}

// Register mocks globally
const mockCanvas = new MockCanvas();
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class extends MockCanvas {},
  writable: true
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(0),
    mark: jest.fn(),
    measure: jest.fn()
  },
  writable: true
});

// Mock video element
class VideoMock {
  videoWidth: number = 1280;
  videoHeight: number = 720;
  play(): Promise<void> {
    return Promise.resolve();
  }
  pause: jest.Mock = jest.fn();
}

Object.defineProperty(window, 'HTMLVideoElement', {
  value: VideoMock,
  writable: true
});

// Mock Image
class MockImage {
  onload?: () => void;

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    });
  }
}

Object.defineProperty(window, 'Image', {
  value: MockImage,
  writable: true
});

// Mock URL API
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() =>
      Promise.resolve({
        getTracks: () => [{
          stop: jest.fn(),
          getSettings: () => ({
            width: 1280,
            height: 720
          })
        }]
      })
    )
  },
  writable: true
});
