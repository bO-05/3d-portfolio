/**
 * ParkingZone component
 * Visual ring marker on the ground to indicate where to park
 * @module components/Scene/ParkingZone
 */

import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide } from 'three';
import { Text, Billboard } from '@react-three/drei';

interface ParkingZoneProps {
    position: [number, number, number];
    isActive: boolean;
}

export const ParkingZone = memo(function ParkingZone({ position, isActive }: ParkingZoneProps) {
    const ringRef = useRef<any>(null);

    useFrame((state) => {
        if (ringRef.current) {
            // Pulsing effect when active
            const scale = isActive
                ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
                : 1;
            ringRef.current.scale.set(scale, scale, scale);
            ringRef.current.rotation.z += 0.01;
        }
    });

    return (
        <group position={position}>
            {/* Visual Ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[2, 2.3, 32]} />
                <meshBasicMaterial
                    color={isActive ? "#4CAF50" : "#ffffff"}
                    transparent
                    opacity={isActive ? 0.8 : 0.3}
                    side={DoubleSide}
                />
            </mesh>

            {/* Parking Icon/Text */}
            <Billboard position={[0, 1.5, 0]}>
                <Text
                    fontSize={1}
                    color={isActive ? "#4CAF50" : "#ffffff"}
                    anchorX="center"
                    anchorY="middle"
                >
                    P
                </Text>
            </Billboard>
        </group>
    );
});
