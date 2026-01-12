/**
 * Static reference objects for visual movement verification
 * These poles don't move so you can clearly see if the vehicle is moving
 * @module components/Scene/ReferenceObjects
 */

import { memo } from 'react';

const POLE_POSITIONS = [
    [10, 0, 0],
    [-10, 0, 0],
    [0, 0, 10],
    [0, 0, -10],
    [20, 0, 20],
    [-20, 0, -20],
    [20, 0, -20],
    [-20, 0, 20],
] as const;

/**
 * Static reference poles to visually verify movement
 * These are fixed in world space - if you see them move, the camera/vehicle is moving
 */
export const ReferenceObjects = memo(function ReferenceObjects() {
    return (
        <>
            {POLE_POSITIONS.map((pos, i) => (
                <group key={i} position={[pos[0], 0, pos[2]]}>
                    {/* Pole */}
                    <mesh position={[0, 2, 0]} castShadow>
                        <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
                        <meshStandardMaterial color={i % 2 === 0 ? "#ff0000" : "#0000ff"} />
                    </mesh>
                    {/* Sphere on top */}
                    <mesh position={[0, 4.5, 0]} castShadow>
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
                    </mesh>
                </group>
            ))}
        </>
    );
});
