import dynamic from 'next/dynamic';

const CameraComponent = dynamic(() => import('../components/CameraComponent'), { ssr: false });

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#19191b', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CameraComponent />
    </div>
  );
}
