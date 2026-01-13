/**
 * useAchievements Hook - Checks and unlocks achievements based on game state
 * @module hooks/useAchievements
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useCollectibleStore } from '../stores/collectibleStore';
import { useAchievementStore } from '../stores/achievementStore';

export function useAchievements() {
    const playerSpeed = useGameStore((state) => state.player.speed);
    const engineOn = useGameStore((state) => state.vehicle.engineOn);
    const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);
    const timeOfDay = useGameStore((state) => state.game.timeOfDay);

    const collected = useCollectibleStore((state) => state.collected);

    const unlock = useAchievementStore((state) => state.unlock);
    const unlocked = useAchievementStore((state) => state.unlocked);
    const incrementEngineToggle = useAchievementStore((state) => state.incrementEngineToggle);
    const addBoostTime = useAchievementStore((state) => state.addBoostTime);
    const engineToggles = useAchievementStore((state) => state.engineToggles);
    const boostSeconds = useAchievementStore((state) => state.boostSeconds);

    const hasMoved = useRef(false);
    const lastEngineState = useRef(engineOn);
    const lastBoostCheck = useRef(Date.now());

    // First Drive - move for the first time
    useEffect(() => {
        if (playerSpeed > 1 && !hasMoved.current && !unlocked.has('first_drive')) {
            hasMoved.current = true;
            unlock('first_drive');
        }
    }, [playerSpeed, unlock, unlocked]);

    // Engine Master - toggle engine 10 times
    useEffect(() => {
        if (engineOn !== lastEngineState.current) {
            lastEngineState.current = engineOn;
            incrementEngineToggle();

            if (engineToggles + 1 >= 10 && !unlocked.has('engine_master')) {
                unlock('engine_master');
            }
        }
    }, [engineOn, incrementEngineToggle, engineToggles, unlock, unlocked]);

    // Explorer - visit all 5 buildings
    useEffect(() => {
        if (visitedBuildings.length >= 5 && !unlocked.has('all_buildings')) {
            unlock('all_buildings');
        }
    }, [visitedBuildings, unlock, unlocked]);

    // Night Owl - play during night
    useEffect(() => {
        if (timeOfDay === 'night' && !unlocked.has('night_owl')) {
            unlock('night_owl');
        }
    }, [timeOfDay, unlock, unlocked]);

    // Speed Demon - boost for 10 seconds total
    useEffect(() => {
        if (isBoosting) {
            const now = Date.now();
            const elapsed = (now - lastBoostCheck.current) / 1000;
            lastBoostCheck.current = now;

            if (elapsed < 1) {
                addBoostTime(elapsed);
            }

            if (boostSeconds >= 10 && !unlocked.has('speed_demon')) {
                unlock('speed_demon');
            }
        } else {
            lastBoostCheck.current = Date.now();
        }
    }, [isBoosting, addBoostTime, boostSeconds, unlock, unlocked]);

    // Collector - find 10 collectibles
    useEffect(() => {
        if (collected.size >= 10 && !unlocked.has('collector')) {
            unlock('collector');
        }
    }, [collected.size, unlock, unlocked]);

    // Completionist - all collectibles + all buildings
    useEffect(() => {
        if (collected.size >= 15 && visitedBuildings.length >= 5 && !unlocked.has('completionist')) {
            unlock('completionist');
        }
    }, [collected.size, visitedBuildings.length, unlock, unlocked]);
}

export default useAchievements;
