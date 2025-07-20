export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html>
      <body style={{ margin: 0, height: '100vh' }}>{children}</body>
    </html>
  );
}
