/**
 * useAchievements Hook - Checks and unlocks achievements based on game state
 * 
 * CRITICAL: Uses refs and getState() to avoid infinite re-render loops.
 * DO NOT add unlock/unlocked/store functions to useEffect dependencies!
 * 
 * @module hooks/useAchievements
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useCollectibleStore } from '../stores/collectibleStore';
import { useAchievementStore } from '../stores/achievementStore';

export function useAchievements() {
    // Game state subscriptions
    const playerSpeed = useGameStore((state) => state.player.speed);
    const engineOn = useGameStore((state) => state.vehicle.engineOn);
    const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);
    const timeOfDay = useGameStore((state) => state.game.timeOfDay);

    const collectedSize = useCollectibleStore((state) => state.collected.size);

    // Refs for tracking (don't cause re-renders)
    const hasMoved = useRef(false);
    const lastEngineState = useRef(engineOn);
    const engineToggleCount = useRef(0);
    const boostTime = useRef(0);
    const lastBoostCheck = useRef(Date.now());
    const boostIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Stable unlock function using getState (no dependency changes)
    const tryUnlock = useCallback((id: string) => {
        const { unlocked, unlock } = useAchievementStore.getState();
        if (!unlocked.has(id)) {
            unlock(id);
        }
    }, []);

    // First Drive - move for the first time
    useEffect(() => {
        if (playerSpeed > 1 && !hasMoved.current) {
            hasMoved.current = true;
            tryUnlock('first_drive');
        }
    }, [playerSpeed, tryUnlock]);

    // Engine Master - toggle engine 10 times
    useEffect(() => {
        if (engineOn !== lastEngineState.current) {
            lastEngineState.current = engineOn;
            engineToggleCount.current += 1;

            if (engineToggleCount.current >= 10) {
                tryUnlock('engine_master');
            }
        }
    }, [engineOn, tryUnlock]);

    // Explorer - visit all 5 buildings
    useEffect(() => {
        if (visitedBuildings.length >= 5) {
            tryUnlock('all_buildings');
        }
    }, [visitedBuildings.length, tryUnlock]);

    // Night Owl - play during night
    useEffect(() => {
        if (timeOfDay === 'night') {
            tryUnlock('night_owl');
        }
    }, [timeOfDay, tryUnlock]);

    // Speed Demon - boost for 10 seconds total (use ref, no state updates)
    useEffect(() => {
        // Clear any existing interval when boosting stops
        if (!isBoosting) {
            if (boostIntervalRef.current) {
                clearInterval(boostIntervalRef.current);
                boostIntervalRef.current = null;
            }
            return;
        }

        // Clear any existing interval before creating a new one (defensive)
        if (boostIntervalRef.current) {
            clearInterval(boostIntervalRef.current);
        }

        // Reset timestamp at the START of boosting to avoid counting downtime
        lastBoostCheck.current = Date.now();

        boostIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - lastBoostCheck.current) / 1000;
            lastBoostCheck.current = now;

            boostTime.current += elapsed;

            if (boostTime.current >= 10) {
                tryUnlock('speed_demon');
                // Cap the value to prevent unbounded growth
                boostTime.current = 10;
                if (boostIntervalRef.current) {
                    clearInterval(boostIntervalRef.current);
                    boostIntervalRef.current = null;
                }
            }
        }, 500);

        return () => {
            if (boostIntervalRef.current) {
                clearInterval(boostIntervalRef.current);
                boostIntervalRef.current = null;
            }
        };
    }, [isBoosting, tryUnlock]);

    // Collector - find 10 collectibles
    useEffect(() => {
        if (collectedSize >= 10) {
            tryUnlock('collector');
        }
    }, [collectedSize, tryUnlock]);

    // Completionist - all collectibles + all buildings
    useEffect(() => {
        if (collectedSize >= 15 && visitedBuildings.length >= 5) {
            tryUnlock('completionist');
        }
    }, [collectedSize, visitedBuildings.length, tryUnlock]);
}

export default useAchievements;
