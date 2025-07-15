import { getAvailableScreenSpace, calculatePreviewSize, calculateUIPositions } from '../previewSize';

describe('getAvailableScreenSpace', () => {
  beforeEach(() => {
    // Mock window dimensions
    global.innerWidth = 1024;
    global.innerHeight = 768;
  });

  it('calculates correct available space', () => {
    const space = getAvailableScreenSpace();
    
    // Screen height minus UI elements, width unchanged
    expect(space.width).toBe(371.4); // 618 * 0.6 (60% of smaller dimension)
    expect(space.height).toBe(371.4);
  });
});

describe('calculatePreviewSize', () => {
  it('maintains aspect ratio within container bounds', () => {
    const mockFrame = {
      width: 1920,
      height: 1080
    } as HTMLImageElement;

    const screen = {
      width: 800,
      height: 600
    };

    const size = calculatePreviewSize(mockFrame, screen);
    
    // Should be 60% of smaller screen dimension
    expect(size.width).toBe(360); // 600 * 0.6
    expect(size.height).toBe(360);
  });
});

describe('calculateUIPositions', () => {
  it('calculates correct UI element positions', () => {
    const previewSize = {
      width: 600,
      height: 400
    };

    const positions = calculateUIPositions(previewSize);

    expect(positions.frame).toEqual({
      width: '100%',
      height: '100%'
    });

    expect(positions.guide).toEqual({
      width: '80%',
      height: '80%',
      top: '10%',
      left: '10%'
    });

    expect(positions.buttons).toEqual({
      bottom: 20,
      width: 600
    });
  });
});
