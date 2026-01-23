/**
 * Main 3D Experience component
 * Contains all scene elements: ground, lighting, camera, vehicle, buildings
 * @module components/Experience
 */

import { memo, useRef, useEffect, Suspense } from 'react';
import { Physics } from '@react-three/cannon';
import { useProgress } from '@react-three/drei';
import { useGameStore } from '../stores/gameStore';
import { trackVehicleMoved } from '../lib/analytics';

// Scene components
import { Ground } from './Scene/Ground';
import { Lighting } from './Scene/Lighting';
import { Sky } from './Scene/Sky';
import { StreetProps } from './Scene/StreetProps';
import { Buildings } from './Buildings/Buildings';
import { Bajaj } from './Vehicle/Bajaj';
import { FollowCamera } from './Camera/FollowCamera';
import { PerformanceMonitor } from './Debug/PerformanceMonitor';
import { CollectibleManager } from './Collectibles/CollectibleManager';
import { InWorldHints } from './UI/InWorldHints';
import { CollectibleSparkle } from './Effects/CollectibleSparkle';
import { DustParticles } from './Effects/DustParticles';
import { usePerformanceGate } from '../hooks/usePerformanceGate';
import { useAudio } from '../hooks/useAudio';
import { useAchievements } from '../hooks/useAchievements';
import { SpeedrunZone } from './Scene/SpeedrunZone';
import { SpeedrunRings } from './Scene/SpeedrunRings';
import { LeaderboardBillboard } from './Scene/LeaderboardBillboard';

/**
 * Main 3D Experience that contains all scene elements
 * Phase 2: 3D models loaded for vehicle and buildings
 * 
 * URL params:
 * - ?debug=true - Show performance monitor
 * - ?orbit=true - Enable orbit controls instead of follow camera
 */
export const Experience = memo(function Experience() {
    const setLoading = useGameStore((state) => state.setLoading);
    const { progress } = useProgress();
    const hasTrackedMovement = useRef(false);
    const playerSpeed = useGameStore((state) => state.player.speed);



    // Use performance gate for auto-quality adjustment
    usePerformanceGate();

    // Audio - engine sound with pitch based on speed
    const { playCollect } = useAudio();

    // Achievement tracking
    useAchievements();

    // Listen for collectible pickups and play sound
    useEffect(() => {
        const handlePickup = () => playCollect();
        window.addEventListener('collectible:pickup', handlePickup);
        return () => window.removeEventListener('collectible:pickup', handlePickup);
    }, [playCollect]);

    // Track first vehicle movement
    useEffect(() => {
        if (playerSpeed > 0 && !hasTrackedMovement.current) {
            trackVehicleMoved();
            hasTrackedMovement.current = true;
        }
    }, [playerSpeed]);

    // Set loading to false once progress is 100
    useEffect(() => {
        if (progress === 100) {
            setLoading(false);
        }
    }, [progress, setLoading]);

    return (
        <Physics
            gravity={[0, -9.81, 0]}
            defaultContactMaterial={{
                friction: 0.8,
                restitution: 0.1,
            }}
        >
            {/* Performance monitor - only visible with ?debug=true */}
            <PerformanceMonitor />

            {/* Camera - follows player with orbit/zoom controls */}
            <FollowCamera />

            {/* Scene Elements */}
            <Lighting />
            <Ground />

            {/* Street environment props */}
            <StreetProps />

            {/* Collectibles */}
            <CollectibleManager />

            {/* Speedrun trigger zone */}
            <SpeedrunZone />

            {/* Speedrun-only rings - only visible during speedrun */}
            <SpeedrunRings />

            {/* In-world leaderboard billboard */}
            <LeaderboardBillboard />

            {/* Sky dome */}
            <Suspense fallback={null}>
                <Sky />
            </Suspense>

            {/* Buildings - loaded asynchronously */}
            <Suspense fallback={null}>
                <Buildings />
            </Suspense>

            {/* Player vehicle - loaded asynchronously */}
            <Suspense fallback={null}>
                <Bajaj />
            </Suspense>

            {/* In-world contextual hints */}
            <InWorldHints />

            {/* Collectible pickup sparkle effects */}
            <CollectibleSparkle />

            {/* Vehicle dust trail particles */}
            <DustParticles />
        </Physics>
    );
});
