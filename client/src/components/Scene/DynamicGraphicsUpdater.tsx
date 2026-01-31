/**
 * DynamicGraphicsUpdater - Updates WebGL renderer settings at runtime
 * 
 * Some settings can be changed dynamically (DPR), others require remount (shadows, antialias).
 * This component handles dynamic updates and triggers reload only when necessary.
 * 
 * @module components/Scene/DynamicGraphicsUpdater
 */

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGraphicsStore } from '../../stores/graphicsStore';

/**
 * Updates renderer settings dynamically where possible
 * For non-dynamic settings (shadows, antialias), stores the initial values
 * and triggers a page reload if they change (with user confirmation in dev)
 */
export function DynamicGraphicsUpdater() {
    const { gl } = useThree();
    const { dpr, shadowsEnabled, antialias } = useGraphicsStore();
    
    // Store initial values for settings that require remount
    const initialSettings = useRef({
        shadowsEnabled,
        antialias,
        initialized: false,
    });

    // Initialize on first render
    useEffect(() => {
        if (!initialSettings.current.initialized) {
            initialSettings.current = {
                shadowsEnabled,
                antialias,
                initialized: true,
            };
        }
    }, [shadowsEnabled, antialias]);

    // Dynamic DPR update - this works at runtime
    useEffect(() => {
        const currentDPR = gl.getPixelRatio();
        if (Math.abs(currentDPR - dpr) > 0.01) {
            gl.setPixelRatio(dpr);
            console.log(`[Graphics] DPR updated: ${currentDPR.toFixed(2)} → ${dpr.toFixed(2)}`);
        }
    }, [gl, dpr]);

    // Check for settings that require remount
    useEffect(() => {
        if (!initialSettings.current.initialized) return;

        const needsRemount =
            initialSettings.current.shadowsEnabled !== shadowsEnabled ||
            initialSettings.current.antialias !== antialias;

        if (needsRemount) {
            console.log('[Graphics] Settings changed that require WebGL context recreation');
            console.log(`  Shadows: ${initialSettings.current.shadowsEnabled} → ${shadowsEnabled}`);
            console.log(`  Antialias: ${initialSettings.current.antialias} → ${antialias}`);
            
            // Defer reload to allow current frame to complete and context to clean up
            // Using setTimeout gives the GPU time to release the old context
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }, [shadowsEnabled, antialias]);

    return null;
}
