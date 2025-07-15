import React from 'react';

interface SharingControlsProps {
  /** Handler for share button click */
  onShare: () => void;
  /** Handler for download button click */
  onDownload: () => void;
  /** Handler for copy button click */
  onCopy: () => void;
}

/**
 * SharingControls component - Container for sharing-related action buttons
 * Positioned below the image preview with consistent spacing and layout
 */
const SharingControls = ({ 
  onShare, 
  onDownload, 
  onCopy 
}: SharingControlsProps): JSX.Element => {
  return (
    <div className="camera-container">
      <div className="preview-container">
        {/* Image content will be passed as children */}
      </div>
      <div className="button-container">
        <button
          onClick={onShare}
          className="btn btn-primary"
          type="button"
        >
          Share
        </button>
        <button
          onClick={onDownload}
          className="btn btn-secondary"
          type="button"
        >
          Download
        </button>
        <button
          onClick={onCopy}
          className="btn btn-outline"
          type="button"
        >
          Copy
        </button>
      </div>
    </div>
  );
};

export default SharingControls;
