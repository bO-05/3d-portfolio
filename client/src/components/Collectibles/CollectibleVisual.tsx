/**
 * CollectibleVisual - Pure visual/animation component
 * 
 * Quality-aware rendering:
 * - Low: Simple sphere with meshBasicMaterial (no lighting calc)
 * - Medium/High: Full detailed shapes with meshStandardMaterial
 * 
 * NO distance checking - handled by CollectibleManager
 * @module components/Collectibles/CollectibleVisual
 */

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useSpeedrunStore } from '../../stores/speedrunStore';
import { useGameStore } from '../../stores/gameStore';
import { COLLECTIBLE_VISUALS, type CollectibleType } from '../../data/collectibles';

interface CollectibleVisualProps {
    id: string;
    type: CollectibleType;
    position: [number, number, number];
}

/**
 * Simple collectible for LOW quality - just a glowing sphere
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

/**
 * 3D shapes for each collectible type (Medium/High quality)
 */
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

/**
 * Pure visual component - floats and spins
 * Distance checking handled by CollectibleManager
 */
export const CollectibleVisual = memo(function CollectibleVisual({
    id,
    type,
    position,
}: CollectibleVisualProps) {
    const permanentCollected = useCollectibleStore((state) => state.collected);
    const speedrunPhase = useSpeedrunStore((state) => state.phase);
    const speedrunCollected = useSpeedrunStore((state) => state.speedrunCollected);
    const graphicsQuality = useGameStore((state) => state.settings.graphicsQuality);
    const groupRef = useRef<Group>(null);

    const visual = COLLECTIBLE_VISUALS[type];

    // During speedrun: check speedrunCollected
    // During normal play: check permanentCollected
    const isCollected = speedrunPhase === 'running'
        ? speedrunCollected.has(id)
        : permanentCollected.has(id);

    // Animation only - no distance check
    useFrame((state) => {
        if (!groupRef.current || isCollected) return;

        const time = state.clock.elapsedTime;
        groupRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.3;
        groupRef.current.rotation.y += 0.015;
    });

    if (isCollected) return null;

    const isLowQuality = graphicsQuality === 'low';
    // 2 tiers: Low (simple sphere, no lights) vs High (full shapes + lights)

    return (
        <group ref={groupRef} position={position}>
            {isLowQuality ? (
                // LOW: Simple bright sphere, meshBasicMaterial, no lights
                <SimpleCollectible color={visual.color} />
            ) : (
                // HIGH: Full detailed shapes with point lights
                <>
                    <CollectibleShape type={type} color={visual.color} emissive={visual.emissive} />
                    <pointLight color={visual.emissive} intensity={3} distance={6} decay={2} />
                </>
            )}
        </group>
    );
});

export default CollectibleVisual;
