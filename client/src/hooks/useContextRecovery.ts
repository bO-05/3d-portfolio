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

        setState(prev => ({
            contextLost: false,
            recoveryAttempts: prev.recoveryAttempts + 1,
        }));

        // Safest recovery is full page reload
        // This ensures all GPU resources are properly re-initialized
        if (state.recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
            window.location.reload();
        } else {
            console.error('[WebGL] Max recovery attempts reached');
        }
    }, [state.recoveryAttempts]);

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
