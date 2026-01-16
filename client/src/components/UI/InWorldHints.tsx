/**
 * InWorldHints - Floating 3D text hints above vehicle
 * Shows contextual hints like "Press E to start engine"
 * Adjusts height based on vehicle type (Bajaj vs TransJakarta)
 * @module components/UI/InWorldHints
 */

import { memo, useState, useEffect, useSyncExternalStore } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
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
    const [yOffset, setYOffset] = useState(0);

    // Define hints with conditions
    const hints: Hint[] = [
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
    ];

    // Check which hint to show
    useEffect(() => {
        const activeHint = hints
            .filter((h) => h.condition())
            .sort((a, b) => a.priority - b.priority)[0];

        if (activeHint && activeHint.text !== currentHint) {
            setCurrentHint(activeHint.text);
            setOpacity(1);
        } else if (!activeHint && currentHint) {
            // Fade out
            setOpacity(0);
            setTimeout(() => setCurrentHint(null), 500);
        }
    }, [engineOn, playerSpeed, visitedBuildings.length]);

    // Floating animation
    useFrame((state) => {
        setYOffset(Math.sin(state.clock.elapsedTime * 2) * 0.1);
    });

    if (!currentHint) return null;

    // TransJakarta bus is taller (scale 5 vs 3), so raise hints higher
    // Bajaj: +4 above player, TransJakarta: +8 above player
    const hintHeight = isTransJakarta ? 8 : 4;

    return (
        <group position={[playerPosition.x, playerPosition.y + hintHeight + yOffset, playerPosition.z]}>
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
