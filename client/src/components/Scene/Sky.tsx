/**
 * Sky component with dynamic day/night changes
 * Supports Jakarta Sky easter egg with day-sky.webp and night-sky.webp textures
 * @module components/Scene/Sky
 */

import { memo, useMemo, useSyncExternalStore, useEffect, useRef } from 'react';
import { Stars, useTexture } from '@react-three/drei';
import { BackSide, Color, SRGBColorSpace, MeshBasicMaterial, Texture } from 'three';
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
                    skyTexture: 'day', // Use day sky for evening (sunset vibes)
                };
            case 'night':
                return {
                    color: '#0c1445',
                    showStars: true,
                    skyTexture: 'night', // Use night sky (aurora)
                };
            case 'day':
            default:
                return {
                    color: '#87ceeb',
                    showStars: false,
                    skyTexture: 'day',
                };
        }
    }, [timeOfDay]);
}

/**
 * Load sky textures with color space configuration
 * Uses useTexture which is Suspense-compatible - parent Suspense handles loading
 */
function useSkyTextures() {
    const textures = useTexture([
        '/textures/day-sky.webp',
        '/textures/night-sky.webp'
    ]);
    const dayTexture = textures[0];
    const nightTexture = textures[1];
    if (dayTexture) dayTexture.colorSpace = SRGBColorSpace;
    if (nightTexture) nightTexture.colorSpace = SRGBColorSpace;
    return { dayTexture, nightTexture };
}

/**
 * Large sphere with dynamic sky color + optional stars at night
 * Supports Jakarta Sky easter egg with:
 * - day-sky.webp for day/evening
 * - night-sky.webp (aurora) for night
 * NOTE: Toggle button is rendered in EasterEggEffects.tsx (DOM context)
 */
export const Sky = memo(function Sky() {
    const config = useSkyConfig();
    const easterEggState = useEasterEggState();
    const materialRef = useRef<MeshBasicMaterial>(null);

    // Load both sky textures (Suspense handles loading)
    const { dayTexture, nightTexture } = useSkyTextures();

    // Show Jakarta Sky when easter egg is active
    const showJakartaSky = easterEggState.jakartaSkyActive;

    // Select texture based on time of day
    const selectedTexture = config.skyTexture === 'night' ? nightTexture : dayTexture;
    const activeTexture: Texture | null = showJakartaSky && selectedTexture ? selectedTexture : null;

    // Update material when Jakarta Sky state or time changes
    useEffect(() => {
        if (materialRef.current) {
            if (showJakartaSky && activeTexture) {
                materialRef.current.map = activeTexture;
                materialRef.current.color.set(0xffffff); // White to show texture colors properly
            } else {
                materialRef.current.map = null;
                materialRef.current.color.set(config.color);
            }
            materialRef.current.needsUpdate = true;
        }
    }, [showJakartaSky, config.color, activeTexture]);

    return (
        <>
            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[500, 64, 64]} />
                <meshBasicMaterial
                    ref={materialRef}
                    side={BackSide}
                    map={activeTexture}
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
