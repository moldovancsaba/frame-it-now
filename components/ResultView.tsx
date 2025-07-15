import React, { type ReactNode } from 'react';

interface ResultViewProps {
  /** Child elements to be rendered within the preview container */
  children: ReactNode;
}

/**
 * ResultView component - Wrapper for preview content
 * Provides consistent container styling and layout for preview content
 */
const ResultView = ({ children }: ResultViewProps): JSX.Element => {
  return (
    <div className="preview-container">
      {children}
    </div>
  );
};

export default ResultView;
