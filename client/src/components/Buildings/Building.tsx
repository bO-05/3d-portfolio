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
    const spotlightTargetRef = useRef<Group>(null);
    const dialogueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const clonedScene = scene.clone();
    const [hovered, setHovered] = useState(false);

    const enterBuilding = useGameStore((state) => state.enterBuilding);
    const markBuildingVisited = useGameStore((state) => state.markBuildingVisited);
    const sessionStart = useGameStore((state) => state.game.sessionStart);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);
    const timeOfDay = useGameStore((state) => state.game.timeOfDay);
    const parkedAt = useGameStore((state) => state.game.parkedAt);
    const setDialogue = useGameStore((state) => state.setDialogue);
    const clearDialogue = useGameStore((state) => state.clearDialogue);

    const isNight = timeOfDay === 'night' || timeOfDay === 'evening';

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

    // Cleanup dialogue timeout on unmount
    useEffect(() => {
        return () => {
            if (dialogueTimeoutRef.current) {
                clearTimeout(dialogueTimeoutRef.current);
            }
        };
    }, []);

    // Hover handlers
    const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        if (parkedAt !== buildingId) {
            document.body.style.cursor = 'not-allowed';
        } else {
            document.body.style.cursor = 'pointer';
        }
    }, [parkedAt, buildingId]);

    const handlePointerOut = useCallback(() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
    }, []);

    // Click handler
    const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();

        if (parkedAt !== buildingId) {
            console.log(`[Building] Cannot enter ${buildingId} - not parked here`);
            setDialogue("I need to park in the designated zone to enter.");
            // Clear any existing timeout before setting new one
            if (dialogueTimeoutRef.current) {
                clearTimeout(dialogueTimeoutRef.current);
            }
            dialogueTimeoutRef.current = setTimeout(clearDialogue, 3000);
            return;
        }

        console.log(`[Building] Clicked: ${buildingId}`);
        enterBuilding(buildingId);
        markBuildingVisited(buildingId);
        trackBuildingEntered(buildingId, sessionStart, visitedBuildings);
    }, [buildingId, enterBuilding, markBuildingVisited, sessionStart, visitedBuildings, parkedAt, setDialogue, clearDialogue]);

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
            {/* Invisible collision box for physics */}
            <mesh ref={physicsRef} visible={false}>
                <boxGeometry args={[2 * scale, 10 * scale, 2 * scale]} />
            </mesh>

            {/* Invisible interaction hitbox - fixed scale, receives pointer events */}
            {/* This prevents hover thrashing when visual model scales */}
            <mesh
                position={[position[0], position[1] + 5 * scale, position[2]]}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            >
                <boxGeometry args={[4 * scale, 12 * scale, 4 * scale]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Visible model - scales on hover, no pointer events */}
            <group
                ref={groupRef}
                position={[position[0], position[1], position[2]]}
                rotation={rotation}
                scale={hoverScale}
            >
                <primitive object={clonedScene} />
            </group>

            {/* Night spotlight - positioned in FRONT of building (world coords) */}
            {/* Uses building rotation to calculate front direction */}
            {isNight && (
                <>
                    {/* Spotlight target group */}
                    <group
                        ref={spotlightTargetRef}
                        position={[position[0], 0, position[2]]}
                    />
                    <spotLight
                        position={[
                            position[0] + Math.sin(rotation[1]) * 8,
                            10,
                            position[2] + Math.cos(rotation[1]) * 8
                        ]}
                        target={spotlightTargetRef.current || undefined}
                        angle={0.6}
                        penumbra={0.5}
                        intensity={50}
                        distance={35}
                        color="#ffcc66"
                        castShadow
                    />
                </>
            )}
        </>
    );
});
