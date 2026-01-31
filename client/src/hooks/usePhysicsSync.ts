/**
 * Hook to sync physics body position and rotation to visual mesh
 * Reduces code duplication across dynamic props (Bench, TrashBin, FoodCart)
 * Handles both position (xyz) and rotation (Euler angles) synchronization
 * @param api - Cannon physics API from useBox hook
 * @param visualRef - React ref to the visual group/mesh
 */

import { useEffect } from 'react';
import type { Group } from 'three';

interface PhysicsApi {
    position: {
        subscribe: (callback: (pos: [number, number, number]) => void) => () => void;
    };
    rotation: {
        subscribe: (callback: (rot: [number, number, number] | [number, number, number, number]) => void) => () => void;
    };
}

export function usePhysicsSync(
    api: PhysicsApi,
    visualRef: React.RefObject<Group>
) {
    useEffect(() => {
        // Subscribe to position updates from physics body
        const unsubPosition = api.position.subscribe((p: [number, number, number]) => {
            if (visualRef.current) {
                visualRef.current.position.set(p[0], p[1], p[2]);
            }
        });

        // Subscribe to rotation updates from physics body (Euler angles or quaternion)
        const unsubRotation = api.rotation.subscribe((r: [number, number, number] | [number, number, number, number]) => {
            if (visualRef.current) {
                // If quaternion (4 values), use setFromQuaternion; otherwise use Euler
                if (r.length === 4) {
                    visualRef.current.quaternion.set(r[0], r[1], r[2], r[3]);
                } else {
                    visualRef.current.rotation.set(r[0], r[1], r[2]);
                }
            }
        });

        // Cleanup subscriptions on unmount
        return () => {
            unsubPosition();
            unsubRotation();
        };
    }, [api, visualRef]);
}
