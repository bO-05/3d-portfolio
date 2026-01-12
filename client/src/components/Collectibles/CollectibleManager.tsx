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

export const CollectibleManager = memo(function CollectibleManager() {
    return (
        <group>
            {COLLECTIBLES.map((collectible) => {
                switch (collectible.container) {
                    case 'none':
                        // Visible floating collectible
                        return (
                            <Collectible
                                key={collectible.id}
                                id={collectible.id}
                                type={collectible.type}
                                position={collectible.position}
                            />
                        );

                    case 'box':
                        // Hidden in breakable box
                        return (
                            <BreakableBox
                                key={collectible.id}
                                collectibleId={collectible.id}
                                position={collectible.position}
                                collectibleType={collectible.type}
                            />
                        );

                    case 'bush':
                        // Hidden in passable bush
                        return (
                            <HiddenBush
                                key={collectible.id}
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
