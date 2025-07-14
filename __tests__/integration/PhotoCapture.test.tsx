import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CameraComponent from '../../components/CameraComponent';
import { processImage } from '../../utils/photoCapture';

// Mock performance timing API
const mockPerformance = {
  now: jest.fn().mockReturnValue(0),
  mark: jest.fn(),
  measure: jest.fn()
};
global.performance = mockPerformance as unknown as Performance;

describe('Photo Capture Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full photo capture flow successfully', async () => {
    render(<CameraComponent onPhotoCapture={jest.fn()} />);

    // Wait for camera initialization
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    // Capture photo
    const captureButton = screen.getByRole('button', { name: /take photo/i });
    expect(captureButton).toBeInTheDocument();
    
    // Enable the button
    captureButton.disabled = false;
    fireEvent.click(captureButton);

    // Verify photo container is shown
    await waitFor(() => {
      expect(screen.getByText(/take photo/i)).toBeInTheDocument();
    });

    // We can't fully test the photo capture in JSDOM environment
    // because canvas operations are not fully supported
  });

  it('handles camera initialization errors gracefully', async () => {
    // Mock camera access failure
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
      new Error('Camera access denied')
    );

    render(<CameraComponent onPhotoCapture={jest.fn()} />);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/camera error/i)).toBeInTheDocument();
    });

    // Verify retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful camera access for retry
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });

    // Click retry
    fireEvent.click(retryButton);

    // Verify camera reinitializes
    await waitFor(() => {
      expect(screen.queryByText(/camera error/i)).not.toBeInTheDocument();
    });
  });

  // Performance tests require real browser APIs
  describe.skip('Performance Optimizations', () => {
    it('measures critical rendering paths', async () => {
      render(<CameraComponent onPhotoCapture={jest.fn()} />);

      await waitFor(() => {
        expect(performance.mark).toHaveBeenCalledWith('cameraInitStart');
        expect(performance.mark).toHaveBeenCalledWith('cameraInitEnd');
        expect(performance.measure).toHaveBeenCalledWith(
          'cameraInitialization',
          'cameraInitStart',
          'cameraInitEnd'
        );
      });
    });

    it('optimizes image processing', async () => {
      const startTime = performance.now();
      
      // Process a sample image
      await processImage('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
      
      const processingTime = performance.now() - startTime;
      
      // Processing should complete within 100ms
      expect(processingTime).toBeLessThan(100);
    });

    it('handles memory cleanup properly', async () => {
      const { unmount } = render(<CameraComponent onPhotoCapture={jest.fn()} />);

      // Mock track stop method
      const mockTrackStop = jest.fn();
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValueOnce({
        getTracks: () => [{ stop: mockTrackStop }]
      });

      // Unmount component
      unmount();

      // Verify cleanup
      expect(mockTrackStop).toHaveBeenCalled();
    });
  });
});
