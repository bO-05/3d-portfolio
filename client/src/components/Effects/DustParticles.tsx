/**
 * DustParticles - Vehicle dust trail effect behind wheels
 * Uses Points + BufferGeometry with pre-allocated arrays (zero GC)
 * @module components/Effects/DustParticles
 */

import { memo, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

const MAX_PARTICLES = 20;
const PARTICLE_LIFETIME = 1.0; // seconds

/**
 * Dust trail behind vehicle when driving
 */
export const DustParticles = memo(function DustParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const playerPosition = useGameStore((state) => state.player.position);
    const playerSpeed = useGameStore((state) => state.player.speed);
    const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
    const showMobileControls = useGameStore((state) => state.ui.showMobileControls);

    // Reduce particles on mobile
    const particleCount = showMobileControls ? 12 : MAX_PARTICLES;

    // Pre-allocate arrays (zero GC during animation)
    const positions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);
    const lifetimes = useRef(new Float32Array(MAX_PARTICLES).fill(0));
    const velocities = useRef(new Float32Array(MAX_PARTICLES * 3));
    const sizes = useMemo(() => new Float32Array(MAX_PARTICLES).fill(0.1), []);

    const emitIndex = useRef(0);
    const lastEmitTime = useRef(0);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const delta = state.clock.getDelta();
        const now = state.clock.elapsedTime;

        // Emit new particles based on speed
        const emitRate = playerSpeed > 2 ? (isBoosting ? 0.03 : 0.08) : 0;

        if (playerSpeed > 2 && now - lastEmitTime.current > emitRate) {
            const idx = emitIndex.current;
            const idx3 = idx * 3;

            // Spawn behind vehicle with some randomness
            positions[idx3] = playerPosition.x + (Math.random() - 0.5) * 1.5;
            positions[idx3 + 1] = 0.1 + Math.random() * 0.3;
            positions[idx3 + 2] = playerPosition.z + (Math.random() - 0.5) * 1.5;

            // Slight upward and outward velocity
            velocities.current[idx3] = (Math.random() - 0.5) * 0.5;
            velocities.current[idx3 + 1] = 0.5 + Math.random() * 0.3;
            velocities.current[idx3 + 2] = (Math.random() - 0.5) * 0.5;

            lifetimes.current[idx] = PARTICLE_LIFETIME;
            sizes[idx] = 0.1 + Math.random() * 0.1;

            emitIndex.current = (emitIndex.current + 1) % particleCount;
            lastEmitTime.current = now;
        }

        // Update all particles
        for (let i = 0; i < particleCount; i++) {
            const lifetime = lifetimes.current[i];
            if (lifetime !== undefined && lifetime > 0) {
                lifetimes.current[i] = lifetime - delta;

                const idx3 = i * 3;
                const vx = velocities.current[idx3] ?? 0;
                const vy = velocities.current[idx3 + 1] ?? 0;
                const vz = velocities.current[idx3 + 2] ?? 0;

                positions[idx3] = (positions[idx3] ?? 0) + vx * delta;
                positions[idx3 + 1] = (positions[idx3 + 1] ?? 0) + vy * delta;
                positions[idx3 + 2] = (positions[idx3 + 2] ?? 0) + vz * delta;

                // Slow down over time
                const v0 = velocities.current[idx3];
                const v1 = velocities.current[idx3 + 1];
                const v2 = velocities.current[idx3 + 2];
                if (v0 !== undefined) velocities.current[idx3] = v0 * 0.98;
                if (v1 !== undefined) velocities.current[idx3 + 1] = v1 * 0.95;
                if (v2 !== undefined) velocities.current[idx3 + 2] = v2 * 0.98;

                // Grow particle as it ages
                const currentLifetime = lifetimes.current[i] ?? 0;
                sizes[i] = 0.1 + (1 - currentLifetime / PARTICLE_LIFETIME) * 0.15;
            } else {
                // Hide dead particles
                positions[i * 3 + 1] = -100;
            }
        }

        const geometry = pointsRef.current.geometry;
        const posAttr = geometry.attributes.position;
        const sizeAttr = geometry.attributes.size;

        if (posAttr) posAttr.needsUpdate = true;
        if (sizeAttr) sizeAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    itemSize={3}
                    count={particleCount}
                />
                <bufferAttribute
                    attach="attributes-size"
                    array={sizes}
                    itemSize={1}
                    count={particleCount}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#8B7355"
                transparent
                opacity={0.6}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
});

export default DustParticles;
