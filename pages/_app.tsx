import '../styles/globals.css';
import '../styles/camera.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return <Component {...pageProps} />;
}

export default MyApp;
