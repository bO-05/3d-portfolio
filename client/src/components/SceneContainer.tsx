import { Suspense, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { Experience } from './Experience';
import { useGraphicsStore } from '../stores/graphicsStore';
import WebGLErrorBoundary from './UI/WebGLErrorBoundary';
import { ContextRecoveryHandler } from './Scene/ContextRecoveryHandler';

/**
 * Container for the 3D Scene
 * Lazy loaded to prevent Three.js execution from blocking initial page load
 * Uses graphics store for adaptive quality based on device capabilities
 */
function SceneContainer() {
    const { dpr, shadowsEnabled, antialias } = useGraphicsStore();

    return (
        <WebGLErrorBoundary>
            <Canvas
                shadows={shadowsEnabled}
                camera={{ position: [0, 15, 12], fov: 50 }}
                gl={{
                    antialias,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: false,
                }}
                dpr={dpr}
            >
                <ContextRecoveryHandler />
                <Perf position="top-left" />
                <Suspense fallback={null}>
                    <Experience />
                </Suspense>
            </Canvas>
        </WebGLErrorBoundary>
    );
}

export default memo(SceneContainer);
