/**
 * Buildings container - places all buildings in the scene
 * @module components/Buildings/Buildings
 */

import { memo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { Building } from './Building';
import { ParkingZone } from '../Scene/ParkingZone';
import { useGameStore } from '../../stores/gameStore';

// Preload all building models
useGLTF.preload('/models/buildings/house.glb');
useGLTF.preload('/models/buildings/internet-cafe.glb');
useGLTF.preload('/models/buildings/library.glb');
useGLTF.preload('/models/buildings/music-studio.glb');
useGLTF.preload('/models/buildings/warung.glb');

// Building configurations
// Y position is set to 0 - the Building component will auto-adjust using bounding box
export const BUILDINGS_CONFIG = [
    {
        id: 'house',
        modelPath: '/models/buildings/house.glb',
        position: [-25, 0, -25] as [number, number, number],
        rotation: [0, Math.PI / 4, 0] as [number, number, number],
        scale: 3,
        parkingPos: [-18, 0.1, -18] as [number, number, number], // Offset parking
    },
    {
        id: 'internet-cafe',
        modelPath: '/models/buildings/internet-cafe.glb',
        position: [25, 0, -25] as [number, number, number],
        rotation: [0, -Math.PI / 4, 0] as [number, number, number],
        scale: 3,
        parkingPos: [18, 0.1, -18] as [number, number, number],
    },
    {
        id: 'library',
        modelPath: '/models/buildings/library.glb',
        position: [-25, 0, 25] as [number, number, number],
        rotation: [0, Math.PI * 0.75, 0] as [number, number, number],
        scale: 3,
        parkingPos: [-18, 0.1, 18] as [number, number, number],
    },
    {
        id: 'music-studio',
        modelPath: '/models/buildings/music-studio.glb',
        position: [25, 0, 25] as [number, number, number],
        rotation: [0, -Math.PI * 0.75, 0] as [number, number, number],
        scale: 3,
        parkingPos: [18, 0.1, 18] as [number, number, number],
    },
    {
        id: 'warung',
        modelPath: '/models/buildings/warung.glb',
        position: [0, 0, -35] as [number, number, number],
        rotation: [0, Math.PI, 0] as [number, number, number],
        scale: 3,
        parkingPos: [0, 0.1, -25] as [number, number, number], // In front of Warung
    },
];

/**
 * Container component that renders all buildings
 */
export const Buildings = memo(function Buildings() {
    const parkedAt = useGameStore((state) => state.game.parkedAt);

    return (
        <Suspense fallback={null}>
            {BUILDINGS_CONFIG.map((config) => (
                <group key={config.id}>
                    <Building
                        buildingId={config.id}
                        modelPath={config.modelPath}
                        position={config.position}
                        rotation={config.rotation}
                        scale={config.scale}
                    />
                    <ParkingZone
                        position={config.parkingPos}
                        isActive={parkedAt === config.id}
                    />
                </group>
            ))}
        </Suspense>
    );
});
