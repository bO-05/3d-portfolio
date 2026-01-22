/**
 * Ground plane with road texture, visible boundary walls, and reset zone
 * Uses road.webp texture for the ground
 * @module components/Scene/Ground
 */

import { memo, useRef, useState, useEffect } from 'react';
import { usePlane, useBox } from '@react-three/cannon';
import { useTexture, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RepeatWrapping } from 'three';
import type { Mesh, Group } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useCollectibleStore } from '../../stores/collectibleStore';

// Ground size
const GROUND_SIZE = 100;

// Boundary walls at OUTER edge of ground
const BOUNDARY_OFFSET = GROUND_SIZE / 2; // 50 - right at the edge
const WALL_HEIGHT = 4;
const WALL_THICKNESS = 1;

/**
 * Visible boundary wall at outer edge
 * Uses meshBasicMaterial for zero lighting cost
 */
const VisibleWall = memo(function VisibleWall({
    position,
    size,
}: {
    position: [number, number, number];
    size: [number, number, number];
}) {
    // Physics collision
    const [ref] = useBox<Mesh>(() => ({
        type: 'Static',
        position,
        args: size,
    }));

    return (
        <group position={position}>
            {/* Physics body (invisible) */}
            <mesh ref={ref} visible={false}>
                <boxGeometry args={size} />
            </mesh>

            {/* Visual wall - dark translucent */}
            <mesh>
                <boxGeometry args={size} />
                <meshBasicMaterial
                    color="#1a1a2e"
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Glow line at base */}
            <mesh position={[0, -size[1] / 2 + 0.1, 0]}>
                <boxGeometry args={[size[0] + 0.1, 0.15, size[2] + 0.1]} />
                <meshBasicMaterial color="#4a4a8a" />
            </mesh>
        </group>
    );
});

/**
 * Reset Zone - Drive over to reset collectibles
 * Uses keyboard Y/N for confirmation
 */
const ResetZone = memo(function ResetZone() {
    const playerPosition = useGameStore((state) => state.player.position);
    const reset = useCollectibleStore((state) => state.reset);
    const collectedCount = useCollectibleStore((state) => state.collected.size);

    const groupRef = useRef<Group>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [message, setMessage] = useState('');

    const ZONE_POSITION: [number, number, number] = [0, 0.1, 8];
    const ZONE_RADIUS = 3;

    // Keyboard listener for Y/N
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showConfirm) return;

            if (e.code === 'KeyY') {
                reset();
                setShowConfirm(false);
                setCooldown(true);
                setMessage('Collectibles reset!');
                setTimeout(() => {
                    setCooldown(false);
                    setMessage('');
                }, 3000);
            } else if (e.code === 'KeyN' || e.code === 'Escape') {
                setShowConfirm(false);
                setCooldown(true);
                setTimeout(() => setCooldown(false), 2000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showConfirm, reset]);

    // Floating animation and distance check
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }

        // Check if player is in zone
        const dx = playerPosition.x - ZONE_POSITION[0];
        const dz = playerPosition.z - ZONE_POSITION[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < ZONE_RADIUS && collectedCount > 0 && !cooldown) {
            if (!showConfirm) {
                setShowConfirm(true);
            }
        } else if (distance >= ZONE_RADIUS + 2) {
            setShowConfirm(false);
        }
    });

    return (
        <>
            {/* Reset zone visual */}
            <group ref={groupRef} position={ZONE_POSITION}>
                {/* Glowing platform */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[ZONE_RADIUS, 24]} />
                    <meshBasicMaterial
                        color="#332244"
                        transparent
                        opacity={0.4}
                    />
                </mesh>

                {/* Inner glow ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[ZONE_RADIUS - 0.3, ZONE_RADIUS, 32]} />
                    <meshBasicMaterial color="#9966ff" />
                </mesh>

                {/* Reset icon (floating text) */}
                <Text
                    position={[0, 1.5, 0]}
                    fontSize={0.8}
                    color="#9966ff"
                    anchorX="center"
                    anchorY="middle"
                >
                    ⟲
                </Text>

                {/* "RESET" label - positioned BELOW icon to avoid overlap */}
                <Text
                    position={[0, 0.7, 0]}
                    fontSize={0.5}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    RESET ZONE
                </Text>
            </group>

            {/* Confirmation prompt - 3D text HIGH above zone for TransJakarta visibility */}
            {showConfirm && (
                <group position={[ZONE_POSITION[0], 6.5, ZONE_POSITION[2]]}>
                    {/* Background panel */}
                    <mesh position={[0, 0, -0.05]}>
                        <planeGeometry args={[6, 2]} />
                        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
                    </mesh>
                    <Text
                        position={[0, 0.4, 0]}
                        fontSize={0.5}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Reset all collectibles?
                    </Text>
                    <Text
                        position={[0, -0.3, 0]}
                        fontSize={0.4}
                        color="#ffff00"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Press Y to confirm, N to cancel
                    </Text>
                </group>
            )}

            {/* Success message - also high */}
            {message && (
                <group position={[ZONE_POSITION[0], 6.5, ZONE_POSITION[2]]}>
                    <mesh position={[0, 0, -0.05]}>
                        <planeGeometry args={[5, 1.5]} />
                        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
                    </mesh>
                    <Text
                        position={[0, 0, 0]}
                        fontSize={0.6}
                        color="#00ff00"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {message}
                    </Text>
                </group>
            )}
        </>
    );
});

/**
 * Ground plane with road texture and physics collision
 */
export const Ground = memo(function Ground() {
    // Load road texture
    const roadTexture = useTexture('/textures/road.webp');

    // Configure texture to repeat
    roadTexture.wrapS = roadTexture.wrapT = RepeatWrapping;
    roadTexture.repeat.set(20, 20);

    // Physics body for ground
    const [ref] = usePlane<Mesh>(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0],
        type: 'Static',
    }));

    return (
        <>
            {/* Ground mesh */}
            <mesh ref={ref} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
                <meshStandardMaterial
                    map={roadTexture}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Reset Zone */}
            <ResetZone />

            {/* Visible boundary walls at OUTER EDGE of ground */}
            {/* North wall - at far edge */}
            <VisibleWall
                position={[0, WALL_HEIGHT / 2, -BOUNDARY_OFFSET]}
                size={[GROUND_SIZE + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]}
            />
            {/* South wall */}
            <VisibleWall
                position={[0, WALL_HEIGHT / 2, BOUNDARY_OFFSET]}
                size={[GROUND_SIZE + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]}
            />
            {/* East wall */}
            <VisibleWall
                position={[BOUNDARY_OFFSET, WALL_HEIGHT / 2, 0]}
                size={[WALL_THICKNESS, WALL_HEIGHT, GROUND_SIZE]}
            />
            {/* West wall */}
            <VisibleWall
                position={[-BOUNDARY_OFFSET, WALL_HEIGHT / 2, 0]}
                size={[WALL_THICKNESS, WALL_HEIGHT, GROUND_SIZE]}
            />
        </>
    );
});
