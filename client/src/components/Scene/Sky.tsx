/**
 * Sky component with dynamic day/night changes
 * Supports Jakarta Sky easter egg with sky.webp texture
 * @module components/Scene/Sky
 */

import { memo, useMemo, useSyncExternalStore, useEffect, useRef } from 'react';
import { Stars, useTexture } from '@react-three/drei';
import { BackSide, Color, SRGBColorSpace, MeshBasicMaterial } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { getEasterEggState, subscribeToEasterEggs } from '../../hooks/useEasterEggs';

/**
 * Hook to subscribe to easter egg state changes
 */
function useEasterEggState() {
    return useSyncExternalStore(subscribeToEasterEggs, getEasterEggState, getEasterEggState);
}

/**
 * Sky configuration based on time of day
 */
function useSkyConfig() {
    const timeOfDay = useGameStore((state) => state.game.timeOfDay);

    return useMemo(() => {
        switch (timeOfDay) {
            case 'evening':
                return {
                    color: '#ff7b54',
                    showStars: false,
                };
            case 'night':
                return {
                    color: '#0c1445',
                    showStars: true,
                };
            case 'day':
            default:
                return {
                    color: '#87ceeb',
                    showStars: false,
                };
        }
    }, [timeOfDay]);
}

/**
 * Load sky texture with color space configuration
 * Uses useTexture which is Suspense-compatible - parent Suspense handles loading
 * If texture fails to load, drei's useTexture will throw and ErrorBoundary can catch
 */
function useSkyTexture(path: string) {
    const texture = useTexture(path);
    texture.colorSpace = SRGBColorSpace;
    return texture;
}

/**
 * Large sphere with dynamic sky color + optional stars at night
 * Supports Jakarta Sky easter egg with beautiful texture
 * NOTE: Toggle button is rendered in EasterEggEffects.tsx (DOM context)
 */
export const Sky = memo(function Sky() {
    const config = useSkyConfig();
    const easterEggState = useEasterEggState();
    const materialRef = useRef<MeshBasicMaterial>(null);

    // Load sky texture (Suspense handles loading, ErrorBoundary handles errors)
    const skyTexture = useSkyTexture('/textures/sky.webp');

    // Show Jakarta Sky when easter egg is active
    const showJakartaSky = easterEggState.jakartaSkyActive;

    // Update material when Jakarta Sky state changes
    useEffect(() => {
        if (materialRef.current) {
            if (showJakartaSky && skyTexture) {
                materialRef.current.map = skyTexture;
                materialRef.current.color.set(0xffffff); // White to show texture colors properly
            } else {
                materialRef.current.map = null;
                materialRef.current.color.set(config.color);
            }
            materialRef.current.needsUpdate = true;
        }
    }, [showJakartaSky, config.color, skyTexture]);

    return (
        <>
            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[500, 64, 64]} />
                <meshBasicMaterial
                    ref={materialRef}
                    side={BackSide}
                    map={showJakartaSky && skyTexture ? skyTexture : null}
                    color={showJakartaSky ? 0xffffff : new Color(config.color)}
                />
            </mesh>

            {/* Stars only visible at night (and Jakarta Sky not active) */}
            {config.showStars && !showJakartaSky && (
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
