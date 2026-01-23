/**
 * Hidden Bush - Passable container with hidden collectible inside
 * No physics - Bajaj can drive through to collect
 * 
 * REQUIREMENTS:
 * - Bush always visible
 * - Collectible visible when NOT in store.collected Set
 * - Distance check uses BUSH world position
 * - Reappears after store.reset()
 * 
 * Quality-aware:
 * - Low: Simple sphere with meshBasicMaterial, no lights
 * - Medium: Full shapes, no lights
 * - High: Full shapes with lights
 * 
 * @module components/Collectibles/HiddenBush
 */

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { type CollectibleType, COLLECTIBLE_VISUALS } from '../../data/collectibles';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useGameStore } from '../../stores/gameStore';

interface HiddenBushProps {
    collectibleId: string;
    position: [number, number, number];
    collectibleType: CollectibleType;
}

/**
 * Simple collectible for LOW quality
 */
function SimpleCollectible({ color }: { color: string }) {
    return (
        <mesh>
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
    );
}

/**
 * Full collectible shape for Medium/High quality
 */
function BushCollectibleShape({
    type,
    color,
    emissive
}: {
    type: CollectibleType;
    color: string;
    emissive: string;
}) {
    if (type === 'orb') {
        return (
            <group>
                <mesh>
                    <sphereGeometry args={[0.4, 24, 16]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={emissive}
                        emissiveIntensity={5}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.2, 16, 12]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
                </mesh>
            </group>
        );
    }
    return (
        <mesh scale={[1.2, 1.2, 1.2]}>
            <octahedronGeometry args={[0.4]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={4} />
        </mesh>
    );
}

export const HiddenBush = memo(function HiddenBush({
    collectibleId,
    position,
    collectibleType,
}: HiddenBushProps) {
    const collect = useCollectibleStore((state) => state.collect);
    const collected = useCollectibleStore((state) => state.collected);
    const playerPosition = useGameStore((state) => state.player.position);
    const graphicsQuality = useGameStore((state) => state.settings.graphicsQuality);

    const collectibleRef = useRef<Group>(null);
    const isCollectingRef = useRef(false);

    const isCollected = collected.has(collectibleId);
    const visual = COLLECTIBLE_VISUALS[collectibleType];
    const COLLECT_RADIUS = 3;

    const isLowQuality = graphicsQuality === 'low';
    // 2 tiers: Low (simple sphere, no lights) vs High (full shapes + lights)

    useFrame((state) => {
        if (!collectibleRef.current || isCollected) return;

        // Animation
        const time = state.clock.elapsedTime;
        collectibleRef.current.position.y = 1.2 + Math.sin(time * 2 + position[0]) * 0.2;
        collectibleRef.current.rotation.y += 0.015;

        // Distance check
        const dx = playerPosition.x - position[0];
        const dz = playerPosition.z - position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < COLLECT_RADIUS && !isCollectingRef.current) {
            isCollectingRef.current = true;
            collect(collectibleId);
        }

        if (distance >= COLLECT_RADIUS) {
            isCollectingRef.current = false;
        }
    });

    return (
        <group position={position}>
            {/* Bush visual - use meshBasicMaterial on Low quality */}
            <group>
                <mesh position={[0, 0.5, 0]}>
                    <sphereGeometry args={[0.8, 8, 6]} />
                    {isLowQuality ? (
                        <meshBasicMaterial color="#228B22" />
                    ) : (
                        <meshStandardMaterial color="#228B22" />
                    )}
                </mesh>
                <mesh position={[0.4, 0.7, 0.3]}>
                    <sphereGeometry args={[0.5, 8, 6]} />
                    {isLowQuality ? (
                        <meshBasicMaterial color="#2E8B57" />
                    ) : (
                        <meshStandardMaterial color="#2E8B57" />
                    )}
                </mesh>
                <mesh position={[-0.4, 0.6, -0.2]}>
                    <sphereGeometry args={[0.5, 8, 6]} />
                    {isLowQuality ? (
                        <meshBasicMaterial color="#32CD32" />
                    ) : (
                        <meshStandardMaterial color="#32CD32" />
                    )}
                </mesh>
                <mesh position={[0, 0.9, -0.3]}>
                    <sphereGeometry args={[0.4, 8, 6]} />
                    {isLowQuality ? (
                        <meshBasicMaterial color="#228B22" />
                    ) : (
                        <meshStandardMaterial color="#228B22" />
                    )}
                </mesh>
            </group>

            {/* Collectible - quality-aware rendering */}
            {!isCollected && (
                <group ref={collectibleRef} position={[0, 1.2, 0]}>
                    {isLowQuality ? (
                        <SimpleCollectible color={visual.color} />
                    ) : (
                        <>
                            <BushCollectibleShape
                                type={collectibleType}
                                color={visual.color}
                                emissive={visual.emissive}
                            />
                            <pointLight color={visual.emissive} intensity={3} distance={6} decay={2} />
                        </>
                    )}
                </group>
            )}
        </group>
    );
});

export default HiddenBush;
