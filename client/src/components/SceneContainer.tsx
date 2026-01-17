import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
// Mobile detection helper
import { Experience } from './Experience';
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

/**
 * Container for the 3D Scene
 * Lazy loaded to prevent Three.js execution from blocking initial page load
 */
export default function SceneContainer() {
    return (
        <Canvas
            shadows={!isMobileDevice}
            camera={{ position: [0, 15, 12], fov: 50 }}
            gl={{
                antialias: !isMobileDevice,
                powerPreference: 'high-performance',
                failIfMajorPerformanceCaveat: false,
            }}
            dpr={isMobileDevice ? [1, 1.5] : [1, 2]}
        >
            <Suspense fallback={null}>
                <Experience />
            </Suspense>
        </Canvas>
    );
}
