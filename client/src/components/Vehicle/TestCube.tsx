/**
 * Test cube component for Phase 0 testing
 * Will be replaced by actual vehicle in Phase 1
 * @module components/Vehicle/TestCube
 */

import { memo, useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameStore } from '../../stores/gameStore';

const ENGINE_FORCE = 500;
const STEER_TORQUE = 50;

/**
 * Test cube with physics and keyboard controls
 * Demonstrates the physics setup for the future vehicle
 */
export const TestCube = memo(function TestCube() {
    const meshRef = useRef<Group>(null);
    const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
    const setPlayerSpeed = useGameStore((state) => state.setPlayerSpeed);
    const keyboard = useKeyboard();

    // Physics body - box shape for testing
    const [ref, api] = useBox<Mesh>(() => ({
        mass: 500,
        args: [2, 1, 3], // width, height, depth
        position: [0, 1, 0],
        linearDamping: 0.5,
        angularDamping: 0.5,
    }));

    // Track velocity for speed display
    const velocity = useRef([0, 0, 0]);
    api.velocity.subscribe((v) => {
        velocity.current = v;
    });

    // Track position for store
    const position = useRef([0, 0, 0]);
    api.position.subscribe((p) => {
        position.current = p;
    });

    // Track rotation
    const rotation = useRef([0, 0, 0, 1]);
    api.quaternion.subscribe((q) => {
        rotation.current = q;
    });

    useFrame(() => {
        // Calculate speed from velocity
        const [vx, , vz] = velocity.current;
        const speed = Math.sqrt(vx * vx + vz * vz);
        setPlayerSpeed(speed);

        // Update player position in store
        const [px, py, pz] = position.current;
        setPlayerPosition({ x: px, y: py, z: pz });

        // Apply forces based on keyboard input
        // Get forward direction from quaternion
        const [qx, qy, qz, qw] = rotation.current;

        // Calculate forward vector (simplified - assumes mostly Y-axis rotation)
        const forwardX = 2 * (qx * qz + qw * qy);
        const forwardZ = 1 - 2 * (qx * qx + qy * qy);

        // Apply engine force
        let enginePower = 0;
        if (keyboard.forward) enginePower = -ENGINE_FORCE;
        if (keyboard.backward) enginePower = ENGINE_FORCE * 0.5;

        if (enginePower !== 0) {
            api.applyForce(
                [forwardX * enginePower, 0, forwardZ * enginePower],
                [0, 0, 0]
            );
        }

        // Apply steering torque
        let steerPower = 0;
        if (keyboard.left) steerPower = STEER_TORQUE;
        if (keyboard.right) steerPower = -STEER_TORQUE;

        if (steerPower !== 0) {
            api.applyTorque([0, steerPower, 0]);
        }
    });

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={[2, 1, 3]} />
            <meshStandardMaterial color="#ff6633" roughness={0.4} metalness={0.6} />
        </mesh>
    );
});
