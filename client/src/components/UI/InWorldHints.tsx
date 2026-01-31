/**
 * InWorldHints - Floating 3D text hints above vehicle
 * Shows contextual hints like "Press E to start engine"
 * Adjusts height based on vehicle type (Bajaj vs TransJakarta)
 * @module components/UI/InWorldHints
 */

import { memo, useState, useEffect, useSyncExternalStore, useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { getEasterEggState, subscribeToEasterEggs } from '../../hooks/useEasterEggs';

interface Hint {
    id: string;
    text: string;
    condition: () => boolean;
    priority: number;
}

/**
 * Hook to subscribe to easter egg state changes
 */
function useEasterEggState() {
    return useSyncExternalStore(subscribeToEasterEggs, getEasterEggState, getEasterEggState);
}

export const InWorldHints = memo(function InWorldHints() {
    const playerPosition = useGameStore((state) => state.player.position);
    const engineOn = useGameStore((state) => state.vehicle.engineOn);
    const playerSpeed = useGameStore((state) => state.player.speed);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);

    // Get vehicle swap state to adjust hint height
    const easterEggState = useEasterEggState();
    const isTransJakarta = easterEggState.vehicleSwapped;

    const [currentHint, setCurrentHint] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(0);
    const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Define hints with conditions - memoized to avoid recreating array
    const hints: Hint[] = useMemo(() => [
        {
            id: 'start-engine',
            text: 'Press E to start engine',
            condition: () => !engineOn,
            priority: 1,
        },
        {
            id: 'drive-hint',
            text: 'Use WASD to drive',
            condition: () => engineOn && playerSpeed < 1,
            priority: 2,
        },
        {
            id: 'boost-hint',
            text: 'Hold SHIFT for boost!',
            condition: () => engineOn && playerSpeed > 5 && playerSpeed < 10,
            priority: 3,
        },
        {
            id: 'explore-buildings',
            text: 'Explore buildings to see projects',
            condition: () => visitedBuildings.length === 0 && playerSpeed > 3,
            priority: 4,
        },
    ], [engineOn, playerSpeed, visitedBuildings.length]);

    // Check which hint to show
    useEffect(() => {
        const activeHint = hints
            .filter((h) => h.condition())
            .sort((a, b) => a.priority - b.priority)[0];

        if (activeHint && activeHint.text !== currentHint) {
            // Cancel pending fade-out timeout to avoid stale clears
            if (fadeTimeoutRef.current) {
                clearTimeout(fadeTimeoutRef.current);
                fadeTimeoutRef.current = null;
            }
            setCurrentHint(activeHint.text);
            setOpacity(1);
        } else if (!activeHint && currentHint) {
            // Fade out
            setOpacity(0);
            fadeTimeoutRef.current = setTimeout(() => setCurrentHint(null), 500);
        }

        // Cleanup on unmount
        return () => {
            if (fadeTimeoutRef.current) {
                clearTimeout(fadeTimeoutRef.current);
            }
        };
    }, [engineOn, playerSpeed, visitedBuildings.length]);

    // Floating animation - use ref to group element to bypass React render cycle
    // Update position directly in useFrame for smooth animation
    const groupRef = useRef<THREE.Group>(null);
    const baseHeightRef = useRef(isTransJakarta ? 6.5 : 4);
    
    // Update base height when vehicle type changes
    baseHeightRef.current = isTransJakarta ? 6.5 : 4;
    
    useFrame((state) => {
        if (!groupRef.current) return;
        
        // Calculate floating offset using sine wave
        const yOffset = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        
        // Update group position directly
        groupRef.current.position.x = playerPosition.x;
        groupRef.current.position.y = playerPosition.y + baseHeightRef.current + yOffset;
        groupRef.current.position.z = playerPosition.z;
    });

    if (!currentHint) return null;

    return (
        <group ref={groupRef}>
            {/* Background pill */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[4, 0.6]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.6 * opacity}
                />
            </mesh>

            {/* Hint text */}
            <Text
                fontSize={0.3}
                color="#ffd700"
                anchorX="center"
                anchorY="middle"
                fillOpacity={opacity}
            >
                {currentHint}
            </Text>
        </group>
    );
});

export default InWorldHints;
