/**
 * Performance gate hook that automatically reduces quality on low FPS
 * Monitors FPS and adjusts graphics settings to maintain smooth performance
 * @module hooks/usePerformanceGate
 */

import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../stores/gameStore';
import { trackPerformanceDegraded } from '../lib/analytics';

const FPS_THRESHOLD = 25; // Below this, we reduce quality
const SAMPLE_DURATION = 5000; // 5 seconds of monitoring
const MIN_SAMPLES = 30; // Minimum samples before making decision

interface PerformanceGateOptions {
    /** Callback when quality should be reduced */
    onDegrade?: () => void;
    /** Whether to automatically update store settings */
    autoUpdate?: boolean;
}

/**
 * Hook that monitors FPS and triggers quality reduction if needed
 * @param options - Configuration options
 * @returns Object with current performance state
 */
export function usePerformanceGate(options: PerformanceGateOptions = {}) {
    const { autoUpdate = true } = options;

    const { gl } = useThree();
    const updateSettings = useGameStore((state) => state.updateSettings);
    const currentQuality = useGameStore((state) => state.settings.graphicsQuality);

    const fpsHistory = useRef<number[]>([]);
    const startTime = useRef<number>(0);
    const hasDegraded = useRef(false);
    const lastFrameTime = useRef(performance.now());

    const calculateAverageFPS = useCallback(() => {
        if (fpsHistory.current.length < MIN_SAMPLES) return null;
        return fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
    }, []);

    const degradeQuality = useCallback(() => {
        if (hasDegraded.current) return;

        const avgFPS = calculateAverageFPS();
        if (avgFPS === null) return;

        // Reduce quality based on current level
        let newQuality: 'low' | 'medium' | 'high';
        if (currentQuality === 'high') {
            newQuality = 'medium';
        } else if (currentQuality === 'medium') {
            newQuality = 'low';
        } else {
            // Already at lowest, nothing to do
            return;
        }

        // Track the degradation
        trackPerformanceDegraded({
            userAgent: navigator.userAgent,
            avgFPS: Math.round(avgFPS),
            qualityLevel: newQuality,
        });

        // Update store if auto-update is enabled
        if (autoUpdate) {
            updateSettings({ graphicsQuality: newQuality });
        }

        // Disable shadows on low quality
        if (newQuality === 'low') {
            gl.shadowMap.enabled = false;
        }

        // Call optional callback
        options.onDegrade?.();

        hasDegraded.current = true;
        console.log(`[Performance] Reduced quality to ${newQuality} due to low FPS (${Math.round(avgFPS)})`);
    }, [autoUpdate, calculateAverageFPS, currentQuality, gl, options, updateSettings]);

    useEffect(() => {
        startTime.current = performance.now();
        lastFrameTime.current = performance.now();

        let animationId: number;

        const measureFrame = () => {
            const now = performance.now();
            const deltaTime = now - lastFrameTime.current;
            lastFrameTime.current = now;

            // Calculate instant FPS
            const fps = 1000 / deltaTime;

            // Only track reasonable values (ignore spikes from tab switching, etc)
            if (fps > 0 && fps < 200) {
                fpsHistory.current.push(fps);
            }

            // After sample duration, check if we need to degrade
            if (now - startTime.current >= SAMPLE_DURATION && !hasDegraded.current) {
                const avgFPS = calculateAverageFPS();

                if (avgFPS !== null && avgFPS < FPS_THRESHOLD) {
                    degradeQuality();
                }
            }

            animationId = requestAnimationFrame(measureFrame);
        };

        animationId = requestAnimationFrame(measureFrame);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [calculateAverageFPS, degradeQuality]);

    return {
        hasDegraded: hasDegraded.current,
        currentQuality,
        averageFPS: calculateAverageFPS(),
    };
}
