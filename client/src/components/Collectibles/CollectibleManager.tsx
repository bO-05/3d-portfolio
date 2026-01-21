/**
 * Collectible Manager - OPTIMIZED with single frame loop
 * Centralizes distance checks for all collectibles (previously 15 separate useFrame hooks)
 * 
 * During speedrun mode, collects are tracked in the speedrun store (isolated)
 * During normal play, collects are tracked in the permanent collectible store
 * 
 * @module components/Collectibles/CollectibleManager
 */

import { memo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLLECTIBLES, COLLECTIBLE_VISUALS } from '../../data/collectibles';
import { CollectibleVisual } from './CollectibleVisual';
import BreakableBox from './BreakableBox';
import HiddenBush from './HiddenBush';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useGameStore } from '../../stores/gameStore';

const COLLECT_RADIUS = 2.5;
const COLLECT_RADIUS_SQ = COLLECT_RADIUS * COLLECT_RADIUS; // Avoid sqrt

export const CollectibleManager = memo(function CollectibleManager() {
    const resetSignal = useCollectibleStore((state) => state.resetSignal);
    const collect = useCollectibleStore((state) => state.collect);
    const collected = useCollectibleStore((state) => state.collected);
    const playerPosition = useGameStore((state) => state.player.position);

    // Note: Regular collectibles don't use speedrun state
    // speedrunCollected is only for rings managed by SpeedrunRings.tsx

    // Track which collectibles are being collected to prevent double-pickup
    const collectingRef = useRef<Set<string>>(new Set());

    // Memoized collect handler
    // During speedrun: regular collectibles are STILL collected as permanent progress (easter eggs)
    // They don't count toward speedrun rings - only SpeedrunRings.tsx manages ring collection
    const handleCollect = useCallback((id: string, position: [number, number, number], emissive: string) => {
        if (collectingRef.current.has(id)) return;
        collectingRef.current.add(id);

        // ALWAYS collect permanently - during speedrun this is still easter egg progress
        collect(id);

        // Dispatch sparkle event
        window.dispatchEvent(new CustomEvent('collectible:sparkle', {
            detail: { position, color: emissive }
        }));

        // Reset the collecting flag after a short delay
        setTimeout(() => {
            collectingRef.current.delete(id);
        }, 100);
    }, [collect]);

    // SINGLE centralized frame loop for ALL visible collectibles
    useFrame(() => {
        // Regular collectibles always check against permanent collected set
        // speedrunCollected is ONLY for speedrun rings (managed by SpeedrunRings.tsx)

        // Only check visible collectibles (container: 'none')
        // Box and bush collectibles handle their own proximity via their containers
        for (const collectible of COLLECTIBLES) {
            if (collectible.container !== 'none') continue;
            if (collected.has(collectible.id)) continue; // Always use permanent collected

            const [cx, , cz] = collectible.position;
            const dx = playerPosition.x - cx;
            const dz = playerPosition.z - cz;

            // Use squared distance to avoid expensive sqrt
            const distSq = dx * dx + dz * dz;

            if (distSq < COLLECT_RADIUS_SQ) {
                const visual = COLLECTIBLE_VISUALS[collectible.type];
                handleCollect(collectible.id, collectible.position, visual.emissive);
            }
        }
    });

    // Clear collecting refs when reset happens
    if (collectingRef.current.size > 0 && collected.size === 0) {
        collectingRef.current.clear();
    }

    return (
        <group>
            {COLLECTIBLES.map((collectible) => {
                // Regular collectibles always check permanent collected set
                // speedrunCollected is ONLY for speedrun rings
                const isCollected = collected.has(collectible.id);

                // Don't render if already collected
                if (isCollected && collectible.container === 'none') {
                    return null;
                }

                const resetKey = `${collectible.id}-${resetSignal}`;

                switch (collectible.container) {
                    case 'none':
                        // Pure visual component - no useFrame, no distance check
                        return (
                            <CollectibleVisual
                                key={resetKey}
                                id={collectible.id}
                                type={collectible.type}
                                position={collectible.position}
                            />
                        );

                    case 'box':
                        return (
                            <BreakableBox
                                key={resetKey}
                                collectibleId={collectible.id}
                                position={collectible.position}
                                collectibleType={collectible.type}
                            />
                        );

                    case 'bush':
                        return (
                            <HiddenBush
                                key={resetKey}
                                collectibleId={collectible.id}
                                position={collectible.position}
                                collectibleType={collectible.type}
                            />
                        );

                    default:
                        return null;
                }
            })}
        </group>
    );
});

export default CollectibleManager;
