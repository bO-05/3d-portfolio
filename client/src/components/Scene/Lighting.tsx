/**
 * Lighting component for the scene
 * Adjusts based on time of day (day/evening/night)
 * @module components/Scene/Lighting
 */

import { memo, useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';

// Building positions for night lights
const BUILDING_LIGHTS = [
    { position: [-25, 5, -25] as [number, number, number] }, // house
    { position: [25, 5, -25] as [number, number, number] },  // internet-cafe
    { position: [-25, 5, 25] as [number, number, number] },  // library
    { position: [25, 5, 25] as [number, number, number] },   // music-studio
    { position: [0, 5, -35] as [number, number, number] },   // warung
];

// Mobile detection for shadow map optimization
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const SHADOW_MAP_SIZE = isMobile ? 512 : 1024;

/**
 * Get lighting config based on time of day
 */
function useLightingConfig() {
    const timeOfDay = useGameStore((state) => state.game.timeOfDay);

    return useMemo(() => {
        switch (timeOfDay) {
            case 'evening':
                return {
                    directionalIntensity: 0.6,
                    directionalColor: '#ff9966',
                    ambientIntensity: 0.3,
                    ambientColor: '#ff9966',
                    showBuildingLights: true,
                    buildingLightIntensity: 0.5,
                };
            case 'night':
                return {
                    directionalIntensity: 0.3,
                    directionalColor: '#6688ff',
                    ambientIntensity: 0.2,
                    ambientColor: '#4466aa',
                    showBuildingLights: true,
                    buildingLightIntensity: 1.0,
                };
            case 'day':
            default:
                return {
                    directionalIntensity: 1.0,
                    directionalColor: '#ffffff',
                    ambientIntensity: 0.4,
                    ambientColor: '#ffffff',
                    showBuildingLights: false,
                    buildingLightIntensity: 0,
                };
        }
    }, [timeOfDay]);
}

/**
 * Scene lighting with directional (sun) and ambient lights
 * Intensity and color change based on time of day
 */
export const Lighting = memo(function Lighting() {
    const config = useLightingConfig();

    return (
        <>
            {/* Hemisphere light for sky/ground color blend */}
            <hemisphereLight
                args={['#87ceeb', '#444444', 0.5]}
                position={[0, 50, 0]}
            />

            {/* Main directional light (sun) */}
            <directionalLight
                position={[10, 20, 10]}
                intensity={config.directionalIntensity}
                color={config.directionalColor}
                castShadow
                shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
            />

            {/* Ambient fill light */}
            <ambientLight
                intensity={config.ambientIntensity}
                color={config.ambientColor}
            />

            {/* Building lights - only at evening/night */}
            {config.showBuildingLights && BUILDING_LIGHTS.map((light, idx) => (
                <pointLight
                    key={idx}
                    position={light.position}
                    intensity={config.buildingLightIntensity}
                    color="#ffaa44"
                    distance={15}
                    decay={2}
                />
            ))}
        </>
    );
});

