/**
 * Breakable Box - Knockable container that reveals a collectible when hit
 * 
 * REQUIREMENTS:
 * - Box has physics, knockable
 * - On collision with enough force → revealBox() called
 * - Collectible appears after knock (uses Collectible component)
 * - After reset: revealedBoxes cleared, but box physics unchanged
 * 
 * @module components/Collectibles/BreakableBox
 */

import { memo, useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import type { Mesh, Group } from 'three';
import { useCollectibleStore } from '../../stores/collectibleStore';
import Collectible from './Collectible';
import { type CollectibleType } from '../../data/collectibles';

interface BreakableBoxProps {
    collectibleId: string;
    position: [number, number, number];
    collectibleType: CollectibleType;
}

export const BreakableBox = memo(function BreakableBox({
    collectibleId,
    position,
    collectibleType,
}: BreakableBoxProps) {
    const revealedBoxes = useCollectibleStore((state) => state.revealedBoxes);
    const collected = useCollectibleStore((state) => state.collected);
    const revealBox = useCollectibleStore((state) => state.revealBox);

    const isBoxRevealed = revealedBoxes.has(collectibleId);
    const isCollected = collected.has(collectibleId);

    const visualRef = useRef<Group>(null);
    // Ref to prevent multiple revealBox calls in same collision
    const hasRevealedRef = useRef(false);

    // Sync ref with store state (handles reset)
    useEffect(() => {
        if (!isBoxRevealed) {
            hasRevealedRef.current = false;
        }
    }, [isBoxRevealed]);

    const [, api] = useBox<Mesh>(() => ({
        type: 'Dynamic',
        mass: 8,
        position: [position[0], position[1] + 0.5, position[2]],
        args: [1, 1, 1],
        angularDamping: 0.3,
        linearDamping: 0.2,
        onCollide: (e) => {
            if (!hasRevealedRef.current && !isBoxRevealed) {
                const velocity = e.contact?.impactVelocity || 0;
                if (velocity > 2) {
                    hasRevealedRef.current = true;
                    revealBox(collectibleId);
                }
            }
        },
    }));

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
        <>
            <group ref={visualRef}>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#8B4513" />
                </mesh>
                <mesh position={[0, 0.3, 0.51]}>
                    <boxGeometry args={[0.9, 0.1, 0.02]} />
                    <meshStandardMaterial color="#654321" />
                </mesh>
                <mesh position={[0, -0.3, 0.51]}>
                    <boxGeometry args={[0.9, 0.1, 0.02]} />
                    <meshStandardMaterial color="#654321" />
                </mesh>
            </group>

            {/* Collectible - visibility from store states */}
            {isBoxRevealed && !isCollected && (
                <Collectible
                    id={collectibleId}
                    type={collectibleType}
                    position={[position[0], position[1] + 1.5, position[2]]}
                />
            )}
        </>
    );
});

export default BreakableBox;
