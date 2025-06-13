import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const DEFAULT_OVERLAY = 'https://i.ibb.co/MDzTJdB8/SEYU-FRAME-1080x1080.png';

function OverlayGuide() {
  return (
    <svg
      viewBox="0 0 300 300"
      width={120}
      height={120}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <ellipse cx="150" cy="140" rx="90" ry="110" fill="none" stroke="#20e3b2" strokeWidth="4" />
      <ellipse cx="115" cy="120" rx="14" ry="10" fill="#fbc531" stroke="#8c52ff" strokeWidth="2" />
      <ellipse cx="185" cy="120" rx="14" ry="10" fill="#fbc531" stroke="#8c52ff" strokeWidth="2" />
      <path d="M120 170 Q150 200 180 170" stroke="#ff5f7e" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function getOverlayUrl() {
  if (typeof window === 'undefined') return DEFAULT_OVERLAY;
  return window.localStorage.getItem('overlayUrl') || DEFAULT_OVERLAY;
}

export default function CameraComponent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [overlayUrl, setOverlayUrl] = useState(DEFAULT_OVERLAY);

  useEffect(() => {
    setOverlayUrl(getOverlayUrl());
    if (!navigator.mediaDevices?.getUserMedia) return;

    let stream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    return () => stream && stream.getTracks().forEach(t => t.stop());
  }, []);

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setPhoto(null);
    setUploadedUrl(null);

    const video = videoRef.current;
    const overlay = new window.Image();
    overlay.crossOrigin = "anonymous";
    overlay.src = overlayUrl;

    overlay.onload = () => {
      const size = 1080;
      canvasRef.current.width = size;
      canvasRef.current.height = size;

      const ctx = canvasRef.current.getContext('2d');
      const vW = video.videoWidth;
      const vH = video.videoHeight;
      const side = Math.min(vW, vH);
      const sx = (vW - side) / 2;
      const sy = (vH - side) / 2;
      ctx.clearRect(0, 0, size, size);

      ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size);
      ctx.drawImage(overlay, 0, 0, size, size);

      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPhoto(dataUrl);

      uploadPhoto(dataUrl);
    };
  };

  const uploadPhoto = async (dataUrl) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          overlayUrl,
        }),
      });
      const json = await resp.json();
      if (json.url) setUploadedUrl(json.url);
      setLoading(false);
    } catch {
      setLoading(false);
      alert('Upload failed');
    }
  };

  const sharePhoto = async () => {
    if (!photo) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Selfie", url: uploadedUrl || photo });
      } catch {}
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const downloadPhoto = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo;
    a.download = 'selfie.png';
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!photo ? (
        <div style={{
          position: 'relative',
          width: 320,
          height: 320,
          margin: '0 auto',
          background: '#000',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 'none',
          border: 'none',
          padding: 0,
        }}>
          <video ref={videoRef} autoPlay playsInline muted width={320} height={320} style={{ borderRadius: 16, objectFit: 'cover', background: '#000' }} />
          {/* SVG fej overlay középen */}
          <OverlayGuide />
          {/* PNG keret overlay (frame) */}
          <Image
            src={overlayUrl}
            alt="overlay"
            width={320}
            height={320}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 3,
              pointerEvents: 'none',
              borderRadius: 16,
            }}
            unoptimized // fontos: külső URL miatt!
            priority
          />
        </div>
      ) : (
        <div style={{ position: 'relative', width: 320, height: 320, margin: '0 auto' }}>
          <Image
            src={photo}
            alt="photo"
            width={320}
            height={320}
            style={{ borderRadius: 16 }}
            unoptimized
            priority
          />
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ margin: '16px 0', display: 'flex', gap: 12 }}>
        {!photo && <button onClick={takePhoto} style={btnStyle}>Take Photo</button>}
        {photo && (
          <>
            <button onClick={downloadPhoto} style={btnStyle}>Download</button>
            <button onClick={sharePhoto} style={btnStyle}>Share</button>
            <button onClick={() => { setPhoto(null); setUploadedUrl(null); }} style={btnStyle}>New</button>
          </>
        )}
      </div>
      {loading && <div style={{ margin: '8px', color: '#20e3b2' }}>Uploading…</div>}
      {uploadedUrl && (
        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#20e3b2', marginTop: 8 }}>
          View on ImgBB
        </a>
      )}
    </div>
  );
}

const btnStyle = {
  background: '#222',
  color: '#20e3b2',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};
