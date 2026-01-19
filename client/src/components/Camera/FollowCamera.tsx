/**
 * 3rd Person Camera with orbit and auto-return
 * - Mouse: orbit around vehicle freely
 * - When driving: smoothly returns behind vehicle
 * @module components/Camera/FollowCamera
 */

import { memo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useGameStore } from '../../stores/gameStore';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Camera settings
const CAMERA_DISTANCE = 15;
const CAMERA_HEIGHT = 8;
const RETURN_SPEED = 0.03; // How fast camera returns behind vehicle when driving

/**
 * Camera that orbits freely but returns behind vehicle when driving
 */
export const FollowCamera = memo(function FollowCamera() {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const playerPosition = useGameStore((state) => state.player.position);
    const playerSpeed = useGameStore((state) => state.player.speed);
    const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
    const { camera } = useThree();

    const targetPosition = useRef(new Vector3());
    const shakeOffset = useRef(new Vector3());

    useFrame((state) => {
        if (!controlsRef.current) return;

        const time = state.clock.elapsedTime;

        // Smooth oscillating shake when boosting (not jarring random noise)
        if (isBoosting) {
            const intensity = 0.08;
            shakeOffset.current.set(
                Math.sin(time * 25) * intensity,
                Math.cos(time * 30) * intensity * 0.5,
                0
            );
        } else {
            // Ease out shake when not boosting
            shakeOffset.current.lerp(new Vector3(), 0.15);
        }

        // Always update the orbit target to follow player
        const target = controlsRef.current.target;
        target.x += (playerPosition.x - target.x) * 0.1;
        target.y += (playerPosition.y + 1 - target.y) * 0.1;
        target.z += (playerPosition.z - target.z) * 0.1;

        // When driving, smoothly move camera behind the vehicle
        if (playerSpeed > 0.5) {
            // Calculate ideal position behind player
            targetPosition.current.set(
                playerPosition.x + shakeOffset.current.x,
                playerPosition.y + CAMERA_HEIGHT + shakeOffset.current.y,
                playerPosition.z + CAMERA_DISTANCE
            );

            // Lerp camera toward ideal position
            camera.position.lerp(targetPosition.current, RETURN_SPEED);
        }

        controlsRef.current.update();
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={5}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.1} // Don't go below ground
            minPolarAngle={0.3}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={-0.5}
        />
    );
});
