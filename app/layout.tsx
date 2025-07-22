'use client';

import ResponsiveScaler from './components/ResponsiveScaler';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html>
      <body style={{ margin: 0, height: '100vh', width: '100vw', overflow: 'hidden', background: '#1a1a1a' }}>
        <ResponsiveScaler aspectRatio={16/9}>
          {children}
        </ResponsiveScaler>
      </body>
    </html>
  );
}
