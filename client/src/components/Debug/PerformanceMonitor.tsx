/**
 * Performance monitoring component for debug mode
 * Shows FPS, draw calls, and memory usage
 * @module components/Debug/PerformanceMonitor
 */

import { memo, useEffect, useRef } from 'react';
import { Perf } from 'r3f-perf';
import { useThree } from '@react-three/fiber';
import { trackFPS } from '../../lib/analytics';

/**
 * Check if debug mode is enabled via URL param
 */
function isDebugMode(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === 'true';
}

/**
 * Performance monitor that only renders in debug mode
 * Sends FPS samples to PostHog every 10 seconds
 */
export const PerformanceMonitor = memo(function PerformanceMonitor() {
    const { gl } = useThree();
    const lastSampleTime = useRef(performance.now());
    const fpsHistoryRef = useRef<number[]>([]);

    // Sample FPS and send to PostHog every 10 seconds
    useEffect(() => {
        if (!isDebugMode()) return;

        let animationId: number;
        let lastTime = performance.now();

        const measureFPS = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Calculate FPS
            const fps = 1000 / deltaTime;
            fpsHistoryRef.current.push(fps);

            // Every 10 seconds, calculate average and send to PostHog
            if (currentTime - lastSampleTime.current >= 10000) {
                const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
                const info = gl.info;

                trackFPS(
                    Math.round(avgFPS),
                    info.render?.calls ?? 0,
                    info.render?.triangles ?? 0
                );

                // Reset for next sample period
                fpsHistoryRef.current = [];
                lastSampleTime.current = currentTime;
            }

            animationId = requestAnimationFrame(measureFPS);
        };

        animationId = requestAnimationFrame(measureFPS);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [gl]);

    // Only show in debug mode
    if (!isDebugMode()) return null;

    return (
        <Perf
            position="top-left"
            minimal={false}
            showGraph={true}
            style={{
                position: 'absolute',
                top: 10,
                left: 10,
            }}
        />
    );
});
