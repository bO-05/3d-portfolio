/**
 * Sky component with dynamic day/night changes
 * Uses gradient colors based on time of day
 * @module components/Scene/Sky
 */

import { memo, useMemo } from 'react';
import { Stars } from '@react-three/drei';
import { BackSide, Color } from 'three';
import { useGameStore } from '../../stores/gameStore';

/**
 * Sky configuration based on time of day
 */
function useSkyConfig() {
    const timeOfDay = useGameStore((state) => state.game.timeOfDay);

    return useMemo(() => {
        switch (timeOfDay) {
            case 'evening':
                return {
                    color: '#ff7b54', // Orange/pink sunset
                    showStars: false,
                };
            case 'night':
                return {
                    color: '#0c1445', // Dark blue night
                    showStars: true,
                };
            case 'day':
            default:
                return {
                    color: '#87ceeb', // Light blue sky
                    showStars: false,
                };
        }
    }, [timeOfDay]);
}

/**
 * Large sphere with dynamic sky color + optional stars at night
 */
export const Sky = memo(function Sky() {
    const config = useSkyConfig();

    return (
        <>
            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[500, 32, 32]} />
                <meshBasicMaterial
                    color={new Color(config.color)}
                    side={BackSide}
                />
            </mesh>

            {/* Stars only visible at night */}
            {config.showStars && (
                <Stars
                    radius={300}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={1}
                />
            )}
        </>
    );
});
