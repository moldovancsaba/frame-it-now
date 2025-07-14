// Mock canvas API
class MockCanvas {
  constructor() {
    this.width = 0;
    this.height = 0;
  }

  getContext(contextType) {
    return {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
      canvas: this,
      fillRect: jest.fn(),
      filter: '',
      setFilter: jest.fn((value) => {
        this.filter = value;
      }),
      getFilter: jest.fn(() => this.filter),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(100),
        width: this.width,
        height: this.height
      }),
      putImageData: jest.fn(),
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockImageData')
    };
  }

  toDataURL() {
    return 'data:image/png;base64,mockImageData';
  }
}

// Mock canvas API
class HTMLCanvasElementMock extends MockCanvas {}
Object.defineProperty(HTMLCanvasElementMock.prototype, 'getContext', {
  value: MockCanvas.prototype.getContext,
  writable: true,
  configurable: true,
});
global.HTMLCanvasElement = HTMLCanvasElementMock;
global.performance = {
  now: jest.fn().mockReturnValue(0),
  mark: jest.fn(),
  measure: jest.fn()
};
global.HTMLVideoElement = class {};

// Enhanced video element mock
class VideoMock {
  constructor() {
    this.videoWidth = 1280;
    this.videoHeight = 720;
  }

  play() {
    return Promise.resolve();
  }

  pause() {}
}
Object.defineProperty(global, 'HTMLVideoElement', {
  writable: true,
  value: VideoMock
});

// Mock Image
class MockImage {
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    });
  }
}

global.Image = MockImage;

// Mock window URL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();


// Mock media devices
Object.defineProperty(global.navigator, 'mediaDevices', {
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
  }
});
