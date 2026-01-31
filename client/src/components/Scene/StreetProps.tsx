/**
 * Street Props Component with Physics Collision
 * Low-poly Jakarta street environment props with solid collision bodies
 * OPTIMIZED: Geometry args extracted to constants to prevent recreation
 * @module components/Scene/StreetProps
 */

import { memo, useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import type { Mesh, Group } from 'three';
import { useCollectibleStore } from '../../stores/collectibleStore';

// Type aliases for geometry args with proper tuple typing
type BoxGeometryArgs = ConstructorParameters<typeof THREE.BoxGeometry>;
type CylinderGeometryArgs = ConstructorParameters<typeof THREE.CylinderGeometry>;
type SphereGeometryArgs = ConstructorParameters<typeof THREE.SphereGeometry>;
type ConeGeometryArgs = ConstructorParameters<typeof THREE.ConeGeometry>;

// ═══════════════════════════════════════════════════════════════
// GEOMETRY CONSTANTS - prevent recreation on every render
// ═══════════════════════════════════════════════════════════════

// Lamppost
const LAMPPOST_PHYSICS_ARGS = [0.4, 6, 0.4] satisfies BoxGeometryArgs;
const LAMPPOST_POLE_ARGS = [0.1, 0.15, 6, 8] satisfies CylinderGeometryArgs;
const LAMPPOST_LIGHT_ARGS = [0.4] satisfies SphereGeometryArgs;

// Tree
const TREE_PHYSICS_ARGS = [1, 4, 1] satisfies BoxGeometryArgs;
const TREE_TRUNK_ARGS = [0.2, 0.35, 3, 8] satisfies CylinderGeometryArgs;
const TREE_FOLIAGE_ARGS = [1.5, 4, 8] satisfies ConeGeometryArgs;

// Bench
const BENCH_PHYSICS_ARGS = [2.2, 1.4, 0.8] satisfies BoxGeometryArgs;
const BENCH_SEAT_ARGS = [2, 0.15, 0.6] satisfies BoxGeometryArgs;  // Original dimensions preserved
const BENCH_BACK_ARGS = [2, 0.6, 0.1] satisfies BoxGeometryArgs;
const BENCH_LEG_ARGS = [0.1, 0.6, 0.5] satisfies BoxGeometryArgs;

// TrashBin
const TRASHBIN_PHYSICS_ARGS = [0.7, 1.1, 0.7] satisfies BoxGeometryArgs;
const TRASHBIN_BODY_ARGS = [0.3, 0.25, 1, 12] satisfies CylinderGeometryArgs;
const TRASHBIN_LID_ARGS = [0.35, 0.35, 0.1, 12] satisfies CylinderGeometryArgs;

// FoodCart
const FOODCART_PHYSICS_ARGS = [2.2, 2, 1.2] satisfies BoxGeometryArgs;
const FOODCART_BODY_ARGS = [2, 1.2, 1] satisfies BoxGeometryArgs;
const FOODCART_ROOF_ARGS = [2.2, 0.1, 1.2] satisfies BoxGeometryArgs;
const FOODCART_POLE_ARGS = [0.05, 0.05, 1.5, 8] satisfies CylinderGeometryArgs;
const FOODCART_UMBRELLA_ARGS = [1.5, 0.6, 8] satisfies ConeGeometryArgs;
const FOODCART_WHEEL_ARGS = [0.2, 0.2, 0.1, 12] satisfies CylinderGeometryArgs;

// StreetSign (removed from scene, constants kept for potential future use)
// const STREETSIGN_PHYSICS_ARGS = [0.3, 2, 0.3];
// const STREETSIGN_POLE_ARGS = [0.1, 2, 0.1];
// const STREETSIGN_BOARD_ARGS = [1, 0.8, 0.05];

// ═══════════════════════════════════════════════════════════════
// LAMPPOST - Pole with diamond light on top (STATIC)
// ═══════════════════════════════════════════════════════════════

const LAMPPOST_POSITIONS: [number, number, number][] = [
    [-35, 0, -20],
    [-35, 0, 20],
    [35, 0, -20],
    [35, 0, 20],
    [-35, 0, 0],
    [35, 0, 0],
];

function Lamppost({ position }: { position: [number, number, number] }) {
     const [physicsRef] = useBox<Mesh>(() => ({
         type: 'Static',
         position: [position[0], position[1] + 3, position[2]],
         args: LAMPPOST_PHYSICS_ARGS,
     }));

     return (
         <group position={position}>
             <mesh ref={physicsRef} visible={false}>
                 <boxGeometry args={LAMPPOST_PHYSICS_ARGS} />
             </mesh>

             {/* Pole */}
             <mesh position={[0, 3, 0]}>
                 <cylinderGeometry args={LAMPPOST_POLE_ARGS} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Diamond light - ALWAYS glowing bright */}
            <mesh position={[0, 6.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                <octahedronGeometry args={LAMPPOST_LIGHT_ARGS} />
                <meshStandardMaterial
                    color="#ffffcc"
                    emissive="#ffaa00"
                    emissiveIntensity={100}
                    toneMapped={false}
                />
            </mesh>

            {/* 360° PointLight - 3x BRIGHTER */}
            <pointLight
                position={[0, 6.5, 0]}
                color="#ffcc66"
                intensity={45}
                distance={75}
                decay={2}
            />
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════
// TREE - Simple cone on trunk (STATIC)
// ═══════════════════════════════════════════════════════════════

const TREE_POSITIONS: [number, number, number][] = [
    [-40, 0, -30],
    [-40, 0, 30],
    [40, 0, -30],
    [40, 0, 30],
    [-40, 0, 0],
    [40, 0, 0],
    [-40, 0, -15],
    [40, 0, 15],
];

function Tree({ position }: { position: [number, number, number] }) {
     const [physicsRef] = useBox<Mesh>(() => ({
         type: 'Static',
         position: [position[0], position[1] + 2, position[2]],
         args: TREE_PHYSICS_ARGS,
     }));

     return (
         <group position={position}>
             <mesh ref={physicsRef} visible={false}>
                 <boxGeometry args={TREE_PHYSICS_ARGS} />
             </mesh>

             {/* Trunk */}
             <mesh position={[0, 1.5, 0]}>
                 <cylinderGeometry args={TREE_TRUNK_ARGS} />
                 <meshStandardMaterial color="#8B4513" />
             </mesh>
             {/* Foliage */}
             <mesh position={[0, 4.5, 0]}>
                 <coneGeometry args={TREE_FOLIAGE_ARGS} />
                <meshStandardMaterial color="#228B22" />
            </mesh>
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════
// BENCH - Wooden bench (DYNAMIC - knockable!)
// ═══════════════════════════════════════════════════════════════

const BENCH_POSITIONS: [number, number, number][] = [
    [-30, 0, -35],
    [-30, 0, 35],
    [30, 0, -35],
    [30, 0, 35],
];

function Bench({ position }: { position: [number, number, number] }) {
     const visualRef = useRef<Group>(null);

     // Physics body - invisible, controls the motion
     const [, api] = useBox<Mesh>(() => ({
         type: 'Dynamic',
         mass: 15,
         position: [position[0], position[1] + 0.7, position[2]],
         args: BENCH_PHYSICS_ARGS,
         angularDamping: 0.5,
         linearDamping: 0.3,
     }));

    // Reset physics on signal
    const resetSignal = useCollectibleStore((state) => state.resetSignal);
    useEffect(() => {
        if (resetSignal > 0) {
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            api.position.set(position[0], position[1] + 0.7, position[2]);
            api.rotation.set(0, 0, 0);
        }
    }, [resetSignal, api, position]);

    // Sync visual mesh to physics body position/rotation
    useEffect(() => {
        const unsubPosition = api.position.subscribe((p) => {
            if (visualRef.current) {
                visualRef.current.position.set(p[0], p[1], p[2]);
            }
        });
        const unsubRotation = api.rotation.subscribe((r) => {
            if (visualRef.current) {
                visualRef.current.rotation.set(r[0], r[1], r[2]);
            }
        });
        return () => {
            unsubPosition();
            unsubRotation();
        };
    }, [api]);

    return (
        <group ref={visualRef}>
            {/* Seat */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={BENCH_SEAT_ARGS} />
                <meshStandardMaterial color="#CD853F" />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.5, -0.25]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={BENCH_BACK_ARGS} />
                <meshStandardMaterial color="#CD853F" />
            </mesh>
            {/* Legs */}
            {[-0.8, 0.8].map((x, i) => (
                <mesh key={i} position={[x, -0.3, 0]}>
                    <boxGeometry args={BENCH_LEG_ARGS} />
                    <meshStandardMaterial color="#333333" />
                </mesh>
            ))}
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════
// TRASH BIN - Cylinder with lid (DYNAMIC - knockable!)
// ═══════════════════════════════════════════════════════════════

const TRASHBIN_POSITIONS: [number, number, number][] = [
    [-32, 0, -35],
    [-32, 0, 35],
    [32, 0, -35],
    [32, 0, 35],
];

function TrashBin({ position }: { position: [number, number, number] }) {
     const visualRef = useRef<Group>(null);

     const [, api] = useBox<Mesh>(() => ({
         type: 'Dynamic',
         mass: 3,
         position: [position[0], position[1] + 0.6, position[2]],
         args: TRASHBIN_PHYSICS_ARGS,
         angularDamping: 0.3,
         linearDamping: 0.2,
     }));

    // Reset physics on signal
    const resetSignal = useCollectibleStore((state) => state.resetSignal);
    useEffect(() => {
        if (resetSignal > 0) {
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            api.position.set(position[0], position[1] + 0.6, position[2]);
            api.rotation.set(0, 0, 0);
        }
    }, [resetSignal, api, position]);

    useEffect(() => {
        const unsubPosition = api.position.subscribe((p) => {
            if (visualRef.current) {
                visualRef.current.position.set(p[0], p[1], p[2]);
            }
        });
        const unsubRotation = api.rotation.subscribe((r) => {
            if (visualRef.current) {
                visualRef.current.rotation.set(r[0], r[1], r[2]);
            }
        });
        return () => {
            unsubPosition();
            unsubRotation();
        };
    }, [api]);

    return (
        <group ref={visualRef}>
            {/* Bin body */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={TRASHBIN_BODY_ARGS} />
                <meshStandardMaterial color="#2E8B57" />
            </mesh>
            {/* Lid */}
            <mesh position={[0, 0.55, 0]}>
                <cylinderGeometry args={TRASHBIN_LID_ARGS} />
                <meshStandardMaterial color="#1E6B47" />
            </mesh>
        </group>
    );
}

// StreetSign component removed - no longer rendered in scene
// (Kept geometry constants above for reference if needed in future)

// ═══════════════════════════════════════════════════════════════
// FOOD CART - Warung style (DYNAMIC - knockable!)
// ═══════════════════════════════════════════════════════════════

function FoodCart({ position }: { position: [number, number, number] }) {
     const visualRef = useRef<Group>(null);

     const [, api] = useBox<Mesh>(() => ({
         type: 'Dynamic',
         mass: 25,
         position: [position[0], position[1] + 1, position[2]],
         args: FOODCART_PHYSICS_ARGS,
         angularDamping: 0.4,
         linearDamping: 0.3,
     }));

    // Reset physics on signal
    const resetSignal = useCollectibleStore((state) => state.resetSignal);
    useEffect(() => {
        if (resetSignal > 0) {
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            api.position.set(position[0], position[1] + 1, position[2]);
            api.rotation.set(0, 0, 0);
        }
    }, [resetSignal, api, position]);

    useEffect(() => {
        const unsubPosition = api.position.subscribe((p) => {
            if (visualRef.current) {
                visualRef.current.position.set(p[0], p[1], p[2]);
            }
        });
        const unsubRotation = api.rotation.subscribe((r) => {
            if (visualRef.current) {
                visualRef.current.rotation.set(r[0], r[1], r[2]);
            }
        });
        return () => {
            unsubPosition();
            unsubRotation();
        };
    }, [api]);

    return (
        <group ref={visualRef}>
            {/* Cart body */}
            <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={FOODCART_BODY_ARGS} />
                <meshStandardMaterial color="#8B0000" />
            </mesh>
            {/* Cart roof */}
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={FOODCART_ROOF_ARGS} />
                <meshStandardMaterial color="#FF4500" />
            </mesh>
            {/* Umbrella pole */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={FOODCART_POLE_ARGS} />
                <meshStandardMaterial color="#654321" />
            </mesh>
            {/* Umbrella */}
            <mesh position={[0, 2.3, 0]}>
                <coneGeometry args={FOODCART_UMBRELLA_ARGS} />
                <meshStandardMaterial color="#FF6347" side={THREE.DoubleSide} />
            </mesh>
            {/* Wheels */}
            {[-0.8, 0.8].map((x, i) => (
                <mesh key={i} position={[x, -0.8, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={FOODCART_WHEEL_ARGS} />
                    <meshStandardMaterial color="#333333" />
                </mesh>
            ))}
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN STREET PROPS COMPONENT
// ═══════════════════════════════════════════════════════════════

export const StreetProps = memo(function StreetProps() {
    return (
        <group>
            {/* Lampposts */}
            {LAMPPOST_POSITIONS.map((pos, i) => (
                <Lamppost key={`lamp-${i}`} position={pos} />
            ))}

            {/* Trees */}
            {TREE_POSITIONS.map((pos, i) => (
                <Tree key={`tree-${i}`} position={pos} />
            ))}

            {/* Benches */}
            {BENCH_POSITIONS.map((pos, i) => (
                <Bench key={`bench-${i}`} position={pos} />
            ))}

            {/* Trash bins */}
            {TRASHBIN_POSITIONS.map((pos, i) => (
                <TrashBin key={`trash-${i}`} position={pos} />
            ))}

            {/* Food cart */}
            <FoodCart position={[5, 0, -30]} />
        </group>
    );
});

export default StreetProps;
