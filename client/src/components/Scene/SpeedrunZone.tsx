/**
 * SpeedrunZone - In-world 3D trigger area for starting timed challenges
 * Located near street sign at [-20, 0, -40]
 * Player drives in → shows prompt → press ENTER → enters initials → timer starts
 * 
 * IMPORTANT: Speedrun uses SEPARATE tracking from permanent collectibles
 * User's normal progress is preserved after speedrun ends
 * 
 * @module components/Scene/SpeedrunZone
 */

import { memo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { Group } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useSpeedrunStore } from '../../stores/speedrunStore';

// Zone positioned near street sign (user requested location)
const ZONE_POSITION: [number, number, number] = [-20, 0.1, -35];
const ZONE_RADIUS = 4;

/**
 * Glowing speedrun trigger zone with tooltip prompts
 */
export const SpeedrunZone = memo(function SpeedrunZone() {
    const playerPosition = useGameStore((state) => state.player.position);
    const playerSpeed = useGameStore((state) => state.player.speed);
    const phase = useSpeedrunStore((state) => state.phase);
    const enterZone = useSpeedrunStore((state) => state.enterZone);
    const leaveZone = useSpeedrunStore((state) => state.leaveZone);
    const startInitialsInput = useSpeedrunStore((state) => state.startInitialsInput);

    const groupRef = useRef<Group>(null);
    const wasInZone = useRef(false);
    const [showPrompt, setShowPrompt] = useState(false);

    // Handle ENTER key press when in ready state
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase === 'ready' && e.code === 'Enter') {
                e.preventDefault();
                startInitialsInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, startInitialsInput]);

    // Floating animation and proximity detection
    useFrame((state) => {
        if (!groupRef.current) return;

        // Floating animation
        groupRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;

        // Distance check
        const dx = playerPosition.x - ZONE_POSITION[0];
        const dz = playerPosition.z - ZONE_POSITION[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        const isInZone = distance < ZONE_RADIUS;
        const isStopped = playerSpeed < 1; // Only show prompt when nearly stopped

        // Zone enter/exit
        if (isInZone && !wasInZone.current) {
            enterZone();
        } else if (!isInZone && wasInZone.current) {
            leaveZone();
            setShowPrompt(false);
        }
        wasInZone.current = isInZone;

        // Show prompt only when in zone and nearly stopped
        if (isInZone && isStopped && phase === 'ready') {
            setShowPrompt(true);
        } else if (!isInZone || phase !== 'ready') {
            setShowPrompt(false);
        }
    });

    // Don't show zone if speedrun is in progress
    if (phase === 'running' || phase === 'countdown' || phase === 'entering_initials') {
        return null;
    }

    return (
        <>
            {/* Visual zone */}
            <group ref={groupRef} position={ZONE_POSITION}>
                {/* Glowing platform - raised slightly to avoid z-fighting */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                    <circleGeometry args={[ZONE_RADIUS, 32]} />
                    <meshBasicMaterial color="#1a2a4a" transparent opacity={0.5} />
                </mesh>

                {/* Outer ring - cyan/blue - raised more to avoid z-fighting */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                    <ringGeometry args={[ZONE_RADIUS - 0.3, ZONE_RADIUS, 32]} />
                    <meshBasicMaterial color="#00aaff" />
                </mesh>

                {/* Timer icon - larger */}
                <Text
                    position={[0, 2.5, 0]}
                    fontSize={1.5}
                    color="#00aaff"
                    anchorX="center"
                    anchorY="middle"
                >
                    ⏱️
                </Text>

                {/* Label - larger font */}
                <Text
                    position={[0, 1.4, 0]}
                    fontSize={0.5}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    TIME TRIAL
                </Text>

                {/* Hint when far - larger font */}
                <Text
                    position={[0, 0.7, 0]}
                    fontSize={0.3}
                    color="#aaaaaa"
                    anchorX="center"
                    anchorY="middle"
                >
                    Park here to start
                </Text>
            </group>

            {/* Prompt when ready and stopped - floating HIGH above for TransJakarta bus */}
            {showPrompt && (
                <group position={[ZONE_POSITION[0], 6.5, ZONE_POSITION[2]]}>
                    {/* Background panel - larger */}
                    <mesh position={[0, 0, -0.05]}>
                        <planeGeometry args={[6, 2]} />
                        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
                    </mesh>

                    {/* Title - larger font */}
                    <Text
                        position={[0, 0.5, 0]}
                        fontSize={0.5}
                        color="#00aaff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        ⏱️ START TIME TRIAL?
                    </Text>

                    {/* Instructions - larger font */}
                    <Text
                        position={[0, 0, 0]}
                        fontSize={0.3}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Collect all 15 items as fast as possible
                    </Text>

                    {/* Action hint - larger font */}
                    <Text
                        position={[0, -0.5, 0]}
                        fontSize={0.4}
                        color="#ffff00"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Press ENTER to begin
                    </Text>
                </group>
            )}
        </>
    );
});

export default SpeedrunZone;
