/**
 * Container for the 3D Scene
 * Lazy loaded to prevent Three.js execution from blocking initial page load
 * Uses graphics store for adaptive quality based on device capabilities
 * 
 * IMPORTANT: Canvas WebGL settings (shadows, antialias) are NOT reactive after mount.
 * - DPR: Updated dynamically via DynamicGraphicsUpdater
 * - Shadows/Antialias: Require page reload (handled by DynamicGraphicsUpdater)
 * 
 * We do NOT use key prop to force remount because:
 * 1. It causes WebGL context conflicts on low-end GPUs (BindToCurrentSequence failed)
 * 2. The old context isn't disposed before new one is created
 * 3. Intel HD Graphics especially has strict context limits
 * 
 * @module components/SceneContainer
 */

import { Suspense, memo, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { Experience } from './Experience';
import { useGraphicsStore } from '../stores/graphicsStore';
import WebGLErrorBoundary from './UI/WebGLErrorBoundary';
import { ContextRecoveryHandler } from './Scene/ContextRecoveryHandler';
import { DynamicGraphicsUpdater } from './Scene/DynamicGraphicsUpdater';

/**
 * Check if debug mode is enabled via URL param
 */
function useDebugMode(): boolean {
    return useMemo(() => {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        return params.get('debug') === 'true';
    }, []);
}

function SceneContainer() {
    // Read initial values - these are used for Canvas initialization only
    // DynamicGraphicsUpdater handles runtime changes
    const { dpr, shadowsEnabled, antialias } = useGraphicsStore();
    const showPerf = useDebugMode();

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
                <DynamicGraphicsUpdater />
                {showPerf && <Perf position="top-left" />}
                <Suspense fallback={null}>
                    <Experience />
                </Suspense>
            </Canvas>
        </WebGLErrorBoundary>
    );
}

export default memo(SceneContainer);
