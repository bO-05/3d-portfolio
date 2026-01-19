/**
 * CollectibleSparkle - GPU-optimized sparkle burst effect on collectible pickup
 * Uses Points + BufferGeometry with pre-allocated arrays (zero GC)
 * @module components/Effects/CollectibleSparkle
 */

import { memo, useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NUM_PARTICLES = 24;
const PARTICLE_LIFETIME = 0.6; // seconds

interface SparkleInstance {
    id: string;
    position: [number, number, number];
    color: string;
    startTime: number;
}

/**
 * Individual sparkle burst at a position
 */
const SparkleBurst = memo(function SparkleBurst({
    position,
    color,
    onComplete
}: {
    position: [number, number, number];
    color: string;
    onComplete: () => void;
}) {
    const pointsRef = useRef<THREE.Points>(null);
    const startTime = useRef(performance.now());

    // Pre-allocate arrays (zero GC during animation)
    const positions = useMemo(() => new Float32Array(NUM_PARTICLES * 3), []);
    const velocities = useRef(new Float32Array(NUM_PARTICLES * 3));
    const opacities = useMemo(() => new Float32Array(NUM_PARTICLES).fill(1), []);

    // Initialize velocities (outward burst)
    useEffect(() => {
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const theta = (Math.PI * 2 * i) / NUM_PARTICLES + Math.random() * 0.3;
            const phi = Math.random() * Math.PI;
            const speed = 3 + Math.random() * 2;

            velocities.current[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities.current[i * 3 + 1] = Math.cos(phi) * speed + 2; // Upward bias
            velocities.current[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

            // Start at origin
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
        }
    }, [positions]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        const elapsed = (performance.now() - startTime.current) / 1000;
        const progress = elapsed / PARTICLE_LIFETIME;

        if (progress >= 1) {
            onComplete();
            return;
        }

        const geometry = pointsRef.current.geometry;
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const opacityAttr = geometry.attributes.opacity as THREE.BufferAttribute;

        // Update each particle
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const idx = i * 3;
            const vx = velocities.current[idx] ?? 0;
            const vy = velocities.current[idx + 1] ?? 0;
            const vz = velocities.current[idx + 2] ?? 0;
            positions[idx] = (positions[idx] ?? 0) + vx * delta;
            positions[idx + 1] = (positions[idx + 1] ?? 0) + vy * delta - 6.25 * delta; // Gravity (6.25 units/sec)
            positions[idx + 2] = (positions[idx + 2] ?? 0) + vz * delta;

            // Fade out
            opacities[i] = 1 - progress;
        }

        posAttr.needsUpdate = true;
        opacityAttr.needsUpdate = true;
    });

    const sparkleColor = useMemo(() => new THREE.Color(color), [color]);

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    itemSize={3}
                    count={NUM_PARTICLES}
                />
                <bufferAttribute
                    attach="attributes-opacity"
                    array={opacities}
                    itemSize={1}
                    count={NUM_PARTICLES}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color={sparkleColor}
                transparent
                opacity={1}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
});

/**
 * Sparkle manager - listens for collectible:pickup events
 */
export const CollectibleSparkle = memo(function CollectibleSparkle() {
    const [sparkles, setSparkles] = useState<SparkleInstance[]>([]);

    // Listen for sparkle pickup events (dispatched from Collectible.tsx)
    useEffect(() => {
        const handleSparkle = (e: Event) => {
            const event = e as CustomEvent<{
                position: [number, number, number];
                color: string;
            }>;
            const { position, color } = event.detail;

            const newSparkle: SparkleInstance = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                position,
                color,
                startTime: performance.now()
            };
            setSparkles(prev => [...prev, newSparkle]);
        };

        window.addEventListener('collectible:sparkle', handleSparkle);
        return () => window.removeEventListener('collectible:sparkle', handleSparkle);
    }, []);

    const handleComplete = (id: string) => {
        setSparkles(prev => prev.filter(s => s.id !== id));
    };

    return (
        <>
            {sparkles.map((sparkle) => (
                <SparkleBurst
                    key={sparkle.id}
                    position={sparkle.position}
                    color={sparkle.color}
                    onComplete={() => handleComplete(sparkle.id)}
                />
            ))}
        </>
    );
});

export default CollectibleSparkle;
