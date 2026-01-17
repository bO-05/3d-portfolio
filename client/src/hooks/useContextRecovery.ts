/**
 * WebGL Context Recovery Hook
 * Handles WebGL context loss/restoration events
 * @module hooks/useContextRecovery
 */

import { useEffect, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';

interface ContextRecoveryState {
    contextLost: boolean;
    recoveryAttempts: number;
}

const MAX_RECOVERY_ATTEMPTS = 3;

/**
 * Hook to handle WebGL context loss and recovery
 * On context loss: prevents default, sets flag
 * On context restore: reloads page (safest recovery)
 */
export function useContextRecovery() {
    const { gl } = useThree();
    const [state, setState] = useState<ContextRecoveryState>({
        contextLost: false,
        recoveryAttempts: 0,
    });

    const handleContextLost = useCallback((event: Event) => {
        event.preventDefault(); // Allow restoration attempt
        console.warn('[WebGL] Context lost');

        setState(prev => ({
            ...prev,
            contextLost: true,
        }));
    }, []);

    const handleContextRestored = useCallback(() => {
        console.log('[WebGL] Context restored, reloading...');

        // Use sessionStorage as source of truth (persists across reloads)
        const STORAGE_KEY = 'webglRecoveryAttempts';
        const currentAttempts = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
        const newAttempts = currentAttempts + 1;
        sessionStorage.setItem(STORAGE_KEY, String(newAttempts));

        // Update React state for in-session UI
        setState({
            contextLost: false,
            recoveryAttempts: newAttempts,
        });

        // Safest recovery is full page reload
        // This ensures all GPU resources are properly re-initialized
        if (newAttempts < MAX_RECOVERY_ATTEMPTS) {
            window.location.reload();
        } else {
            console.error('[WebGL] Max recovery attempts reached');
            // Clear for next session
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        const canvas = gl.domElement;

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);

        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, [gl.domElement, handleContextLost, handleContextRestored]);

    return state;
}
