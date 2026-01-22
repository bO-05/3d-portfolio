/**
 * Collectible Component - Floating, spinning, glowing 3D badge
 * Uses distance-based detection instead of physics (no lag!)
 * 
 * REQUIREMENTS:
 * - Visible when NOT in store.collected Set
 * - Collectable when player within 2.5 units AND not collected
 * - Instantly hides on collection
 * - Reappears after store.reset()
 * 
 * @module components/Collectibles/Collectible
 */

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useGameStore } from '../../stores/gameStore';
import { COLLECTIBLE_VISUALS, type CollectibleType } from '../../data/collectibles';

/**
 * Simple collectible for LOW quality - bright sphere, no lighting calc
 */
const SimpleCollectible = memo(function SimpleCollectible({
    color,
}: {
    color: string;
}) {
    return (
        <mesh>
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
    );
});

interface CollectibleProps {
    id: string;
    type: CollectibleType;
    position: [number, number, number];
}

// 3D shapes for each collectible type
const CollectibleShape = memo(function CollectibleShape({
    type,
    color,
    emissive
}: {
    type: CollectibleType;
    color: string;
    emissive: string;
}) {
    switch (type) {
        case 'kopi':
            return (
                <group>
                    <mesh>
                        <cylinderGeometry args={[0.35, 0.3, 0.6, 16]} />
                        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.15, 0.05, 8, 16, Math.PI]} />
                        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} />
                    </mesh>
                </group>
            );
        case 'target':
            return (
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh>
                        <torusGeometry args={[0.4, 0.08, 8, 24]} />
                        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} />
                    </mesh>
                    <mesh>
                        <torusGeometry args={[0.2, 0.08, 8, 24]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffcccc" emissiveIntensity={2} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[0.1, 12, 8]} />
                        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={3} />
                    </mesh>
                </group>
            );
        case 'star':
            return (
                <mesh scale={[1.2, 1.2, 1.2]}>
                    <octahedronGeometry args={[0.4]} />
                    <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={4} />
                </mesh>
            );
        case 'note':
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[0.5, 0.65, 0.05]} />
                        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0, 0.1, 0.03]}>
                        <boxGeometry args={[0.35, 0.03, 0.01]} />
                        <meshStandardMaterial color="#aaaaaa" />
                    </mesh>
                    <mesh position={[0, -0.05, 0.03]}>
                        <boxGeometry args={[0.35, 0.03, 0.01]} />
                        <meshStandardMaterial color="#aaaaaa" />
                    </mesh>
                    <mesh position={[0, -0.2, 0.03]}>
                        <boxGeometry args={[0.25, 0.03, 0.01]} />
                        <meshStandardMaterial color="#aaaaaa" />
                    </mesh>
                </group>
            );
        case 'orb':
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
        default:
            return (
                <mesh>
                    <sphereGeometry args={[0.4]} />
                    <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} />
                </mesh>
            );
    }
});

export const Collectible = memo(function Collectible({
    id,
    type,
    position,
}: CollectibleProps) {
    const collect = useCollectibleStore((state) => state.collect);
    const collected = useCollectibleStore((state) => state.collected);
    const playerPosition = useGameStore((state) => state.player.position);
    const graphicsQuality = useGameStore((state) => state.settings.graphicsQuality);

    const groupRef = useRef<Group>(null);
    // Ref to prevent calling collect() multiple times in same collection event
    // This ref gets "reset" naturally when component unmounts/remounts
    const isCollectingRef = useRef(false);

    const visual = COLLECTIBLE_VISUALS[type];
    const isCollected = collected.has(id);
    const COLLECT_RADIUS = 2.5;

    useFrame((state) => {
        // ONLY check isCollected here - NOT the ref!
        // This allows animation to run for uncollected items
        if (!groupRef.current || isCollected) return;

        // Animation
        const time = state.clock.elapsedTime;
        groupRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.3;
        groupRef.current.rotation.y += 0.015;

        // Distance check
        const dx = playerPosition.x - position[0];
        const dz = playerPosition.z - position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Only guard the collect() call with the ref
        if (distance < COLLECT_RADIUS && !isCollectingRef.current) {
            isCollectingRef.current = true;
            collect(id);

            // Dispatch sparkle event with position and color (for visual feedback)
            window.dispatchEvent(new CustomEvent('collectible:sparkle', {
                detail: {
                    position: [position[0], position[1], position[2]] as [number, number, number],
                    color: visual.emissive
                }
            }));
        }

        // Reset ref when player moves away (allows re-collection after reset)
        if (distance >= COLLECT_RADIUS) {
            isCollectingRef.current = false;
        }
    });

    // Visibility ONLY based on store state
    if (isCollected) return null;

    const isLowQuality = graphicsQuality === 'low';
    // 2 tiers: Low (simple sphere, no lights) vs High (full shapes + lights)

    return (
        <group ref={groupRef} position={position}>
            {isLowQuality ? (
                <SimpleCollectible color={visual.color} />
            ) : (
                <>
                    <CollectibleShape type={type} color={visual.color} emissive={visual.emissive} />
                    <pointLight color={visual.emissive} intensity={3} distance={6} decay={2} />
                </>
            )}
        </group>
    );
});

export default Collectible;
