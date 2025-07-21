'use client';

interface IMessageOverlayProps {
  type: 'error' | 'loading';
  message: string;
}

const styles = {
  messageContainer: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    textAlign: 'center' as const,
    zIndex: 1000
  },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)'
  },
  loading: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  }
};

export function MessageOverlay({ type, message }: IMessageOverlayProps): JSX.Element {
  return (
    <div 
      style={{
        ...styles.messageContainer,
        ...(type === 'error' ? styles.error : styles.loading)
      }}
    >
      {message}
    </div>
  );
}
