import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraStatusIndicator, CameraButton, ErrorTooltip, CameraState } from '../CameraUI';

describe('CameraStatusIndicator', () => {
  it('shows correct status text and color for each state', () => {
    const states = Object.values(CameraState);
    
    states.forEach(state => {
      const { container } = render(<CameraStatusIndicator state={state} />);
      
      // Check status text is present
      const statusText = screen.getByRole('status');
      expect(statusText).toBeInTheDocument();
      
      // Verify color indicator is present
      const indicator = container.querySelector('div[aria-hidden="true"]');
      expect(indicator).toHaveClass('rounded-full');
      
      // Clean up for next test
      screen.unmount();
    });
  });
});

describe('CameraButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with correct text based on state', () => {
    const { rerender } = render(
      <CameraButton 
        disabled={false} 
        onClick={mockOnClick} 
        state={CameraState.READY} 
      />
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Take Photo');
    
    rerender(
      <CameraButton 
        disabled={false} 
        onClick={mockOnClick} 
        state={CameraState.CAPTURING} 
      />
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Capturing...');
  });

  it('handles disabled state correctly', () => {
    render(
      <CameraButton 
        disabled={true} 
        onClick={mockOnClick} 
        state={CameraState.READY} 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-disabled');
    
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});

describe('ErrorTooltip', () => {
  it('displays error message and code when provided', () => {
    const error = {
      message: 'Camera access denied',
      code: 'PERMISSION_DENIED'
    };
    
    render(<ErrorTooltip error={error} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
    expect(screen.getByText(`Error code: ${error.code}`)).toBeInTheDocument();
  });

  it('displays only error message when no code is provided', () => {
    const error = {
      message: 'Camera access denied'
    };
    
    render(<ErrorTooltip error={error} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
    expect(screen.queryByText(/Error code:/)).not.toBeInTheDocument();
  });
});
