import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CameraComponent from '../CameraComponent';

describe('CameraComponent', () => {
  let mockNavigation;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockNavigation = {
      reload: jest.fn()
    };
  });

  it('renders camera component correctly', () => {
render(<CameraComponent onPhotoCapture={jest.fn()} navigation={mockNavigation} />);
    expect(screen.getByTestId('camera-container')).toBeInTheDocument();
  });

  it('initializes camera stream on mount', async () => {
    render(<CameraComponent onPhotoCapture={jest.fn()} navigation={mockNavigation} />);
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' }
      });
    });
  });

  it('captures photo when capture button is clicked', async () => {
    const mockOnPhotoCapture = jest.fn();
    render(<CameraComponent onPhotoCapture={mockOnPhotoCapture} navigation={mockNavigation} />);

    // Wait for camera initialization
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    // Simulate capture button click
    fireEvent.click(screen.getByRole('button', { name: /take photo/i }));

    await waitFor(() => {
      expect(mockOnPhotoCapture).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it('handles camera initialization errors', async () => {
    // Mock getUserMedia to reject
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
      new Error('Camera access denied')
    );

    render(<CameraComponent onPhotoCapture={jest.fn()} navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText(/camera error/i)).toBeInTheDocument();
    });
  });
});
