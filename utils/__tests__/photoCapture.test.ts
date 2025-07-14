import { capturePhoto, processImage, validateImage } from '../photoCapture';

describe('Photo Capture Utilities', () => {
  const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

  describe('capturePhoto', () => {
    it('captures photo from video element', () => {
      const mockVideoElement = {
        videoWidth: 1280,
        videoHeight: 720,
        play: jest.fn(),
        pause: jest.fn()
      } as unknown as HTMLVideoElement;

      const mockCanvasElement = {
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
          canvas: {
            toDataURL: jest.fn().mockReturnValue(mockImageData)
          }
        })
      } as unknown as HTMLCanvasElement;

      const result = capturePhoto(mockVideoElement, mockCanvasElement);
      expect(result).toBe(mockImageData);
    });

    it('throws error if video dimensions are invalid', () => {
      const mockVideoElement = {
        videoWidth: 0,
        videoHeight: 0
      } as unknown as HTMLVideoElement;

      const mockCanvasElement = {} as HTMLCanvasElement;

      expect(() => capturePhoto(mockVideoElement, mockCanvasElement))
        .toThrow('Invalid video dimensions');
    });
  });

  describe('processImage', () => {
    it('processes image data correctly', async () => {
      const result = await processImage(mockImageData);
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('format');
    });

    it('throws error for invalid image data', async () => {
      await expect(processImage('invalid-data'))
        .rejects
        .toThrow('Invalid image data');
    });
  });

  describe('validateImage', () => {
    it('validates correct image dimensions', () => {
      const imageData = {
        width: 1280,
        height: 720,
        format: 'jpeg'
      };

      expect(validateImage(imageData)).toBe(true);
    });

    it('rejects invalid image dimensions', () => {
      const imageData = {
        width: 100,
        height: 50,
        format: 'jpeg'
      };

      expect(validateImage(imageData)).toBe(false);
    });

    it('rejects unsupported formats', () => {
      const imageData = {
        width: 1280,
        height: 720,
        format: 'gif'
      };

      expect(validateImage(imageData)).toBe(false);
    });
  });
});
