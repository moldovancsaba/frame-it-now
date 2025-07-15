import dynamic from 'next/dynamic';

const CameraComponent = dynamic(() => import('../components/CameraComponent'), { ssr: false })

export default function Home(): JSX.Element {
  return <CameraComponent />;
}
