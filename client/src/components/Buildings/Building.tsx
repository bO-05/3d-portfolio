/**
 * Building component with automatic ground placement + interactivity
 * Uses bounding box to ensure model sits ON the ground, not buried
 * Hover effects and click handlers for building interaction
 * @module components/Buildings/Building
 */

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { ThreeEvent } from '@react-three/fiber';
import { Box3, Vector3, Group } from 'three';
import type { Mesh } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { trackBuildingEntered } from '../../lib/analytics';

interface BuildingProps {
    /** Unique building identifier */
    buildingId: string;
    /** Path to the GLB model */
    modelPath: string;
    /** Position in world [x, y, z] - Y will be adjusted automatically */
    position: [number, number, number];
    /** Rotation in radians [x, y, z] */
    rotation?: [number, number, number];
    /** Scale factor */
    scale?: number;
}

/**
 * Building component with hover/click interactivity
 */
export const Building = memo(function Building({
    buildingId,
    modelPath,
    position,
    rotation = [0, 0, 0],
    scale = 1,
}: BuildingProps) {
    const { scene } = useGLTF(modelPath);
    const groupRef = useRef<Group>(null);
    const clonedScene = scene.clone();
    const [hovered, setHovered] = useState(false);

    const enterBuilding = useGameStore((state) => state.enterBuilding);
    const markBuildingVisited = useGameStore((state) => state.markBuildingVisited);
    const sessionStart = useGameStore((state) => state.game.sessionStart);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);

    // Calculate bounding box and adjust Y position
    useEffect(() => {
        if (groupRef.current) {
            const box = new Box3().setFromObject(groupRef.current);
            const size = new Vector3();
            box.getSize(size);
            const minY = box.min.y;
            const offsetY = -minY;
            groupRef.current.position.y = position[1] + offsetY;
            console.log(`[Building] ${buildingId}: minY=${minY.toFixed(2)}, offsetY=${offsetY.toFixed(2)}`);
        }
    }, [modelPath, position, buildingId, scale]);

    // Hover handlers
    const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
    }, []);

    const handlePointerOut = useCallback(() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
    }, []);

    // Click handler
    const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        console.log(`[Building] Clicked: ${buildingId}`);
        enterBuilding(buildingId);
        markBuildingVisited(buildingId);
        trackBuildingEntered(buildingId, sessionStart, visitedBuildings);
    }, [buildingId, enterBuilding, markBuildingVisited, sessionStart, visitedBuildings]);

    // Static physics body for collision
    const [physicsRef] = useBox<Mesh>(() => ({
        type: 'Static',
        args: [2 * scale, 10 * scale, 2 * scale],
        position: [position[0], 5 * scale, position[2]],
        rotation,
    }));

    // Calculate hover scale
    const hoverScale = hovered ? scale * 1.03 : scale;

    return (
        <>
            {/* Invisible collision box */}
            <mesh ref={physicsRef} visible={false}>
                <boxGeometry args={[2 * scale, 10 * scale, 2 * scale]} />
            </mesh>

            {/* Visible model with hover/click interactivity */}
            <group
                ref={groupRef}
                position={[position[0], position[1], position[2]]}
                rotation={rotation}
                scale={hoverScale}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            >
                <primitive object={clonedScene} />
            </group>
        </>
    );
});
