/**
 * Collectible Manager - Spawns all collectibles in the scene
 * Handles visible, box-hidden, and bush-hidden collectibles
 * @module components/Collectibles/CollectibleManager
 */

import { memo } from 'react';
import { COLLECTIBLES } from '../../data/collectibles';
import Collectible from './Collectible';
import BreakableBox from './BreakableBox';
import HiddenBush from './HiddenBush';
import { useCollectibleStore } from '../../stores/collectibleStore';

export const CollectibleManager = memo(function CollectibleManager() {
    const resetSignal = useCollectibleStore((state) => state.resetSignal);

    return (
        <group>
            {COLLECTIBLES.map((collectible) => {
                // Key includes resetSignal to force full remount/physics reset
                const resetKey = `${collectible.id}-${resetSignal}`;

                switch (collectible.container) {
                    case 'none':
                        // Visible floating collectible
                        return (
                            <Collectible
                                key={resetKey}
                                id={collectible.id}
                                type={collectible.type}
                                position={collectible.position}
                            />
                        );

                    case 'box':
                        // Hidden in breakable box
                        return (
                            <BreakableBox
                                key={resetKey}
                                collectibleId={collectible.id}
                                position={collectible.position}
                                collectibleType={collectible.type}
                            />
                        );

                    case 'bush':
                        // Hidden in passable bush
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
