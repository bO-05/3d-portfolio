/**
 * Convex Sync Hook
 * Central orchestrator for syncing game progress to Convex backend
 * Listens for store events and batches updates with debouncing
 * @module hooks/useConvexSync
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useVisitorId } from './useVisitorId';
import { useCollectibleStore } from '../stores/collectibleStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useGameStore } from '../stores/gameStore';

// Debounce delay for batching rapid updates
const SYNC_DEBOUNCE_MS = 500;

/**
 * Hook that manages bidirectional sync with Convex backend
 * - On mount: loads server state and merges with local
 * - On changes: debounced upload to server
 */
export function useConvexSync(): void {
    const visitorId = useVisitorId();

    // Convex mutations and queries
    const syncProgress = useMutation(api.progress.syncProgress);
    const serverProgress = useQuery(api.progress.getProgress, { visitorId });

    // Store accessors
    const collectibleStore = useCollectibleStore;
    const achievementStore = useAchievementStore;
    const gameStore = useGameStore;

    // Debounce timer ref
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasMergedRef = useRef(false);

    /**
     * Merge server state with local state on initial load
     * Only runs once when server data arrives
     * undefined = still loading, null = no record (new player)
     */
    useEffect(() => {
        // Still loading - wait for server response
        if (serverProgress === undefined || hasMergedRef.current) return;

        hasMergedRef.current = true;

        // Get current local state
        const localCollectibles = collectibleStore.getState().collected;
        const localAchievements = achievementStore.getState().unlocked;
        const localBuildings = gameStore.getState().game.visitedBuildings;

        // Handle null (new player) - use empty arrays from server
        const serverCollectibles = serverProgress?.collectibles ?? [];
        const serverAchievements = serverProgress?.achievements ?? [];
        const serverBuildings = serverProgress?.visitedBuildings ?? [];

        // Merge with server state (union of both)
        const mergedCollectibles = new Set([
            ...localCollectibles,
            ...serverCollectibles,
        ]);
        const mergedAchievements = new Set([
            ...localAchievements,
            ...serverAchievements,
        ]);
        const mergedBuildings = [...new Set([
            ...localBuildings,
            ...serverBuildings,
        ])];

        // Update local stores if server had more data
        if (mergedCollectibles.size > localCollectibles.size) {
            collectibleStore.setState({ collected: mergedCollectibles });
        }
        if (mergedAchievements.size > localAchievements.size) {
            achievementStore.setState({ unlocked: mergedAchievements });
        }
        if (mergedBuildings.length > localBuildings.length) {
            // Update visited buildings in gameStore
            gameStore.setState((state) => ({
                game: { ...state.game, visitedBuildings: mergedBuildings },
            }));
        }

        console.log('[ConvexSync] Merged server progress:', {
            collectibles: mergedCollectibles.size,
            achievements: mergedAchievements.size,
            buildings: mergedBuildings.length,
        });
    }, [serverProgress, collectibleStore, achievementStore, gameStore]);

    /**
     * Debounced sync function - uploads current state to server
     */
    const performSync = useCallback(async () => {
        const collectibles = Array.from(collectibleStore.getState().collected);
        const achievements = Array.from(achievementStore.getState().unlocked);
        const visitedBuildings = gameStore.getState().game.visitedBuildings;

        try {
            await syncProgress({
                visitorId,
                collectibles,
                achievements,
                visitedBuildings,
            });
            console.log('[ConvexSync] Synced to server');
        } catch (error) {
            console.warn('[ConvexSync] Sync failed (will retry):', error);
            // Don't throw - graceful degradation to localStorage-only mode
        }
    }, [visitorId, syncProgress, collectibleStore, achievementStore, gameStore]);

    /**
     * Schedule a debounced sync
     */
    const scheduleSync = useCallback(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
            performSync();
        }, SYNC_DEBOUNCE_MS);
    }, [performSync]);

    /**
     * Listen for store events and trigger sync
     */
    useEffect(() => {
        // Event handlers for store changes
        const handleCollectibleSync = () => scheduleSync();
        const handleAchievementSync = () => scheduleSync();
        const handleBuildingVisit = () => scheduleSync();

        // Subscribe to custom events emitted by stores
        window.addEventListener('collectible:sync', handleCollectibleSync);
        window.addEventListener('achievement:sync', handleAchievementSync);
        window.addEventListener('building:visited', handleBuildingVisit);

        return () => {
            window.removeEventListener('collectible:sync', handleCollectibleSync);
            window.removeEventListener('achievement:sync', handleAchievementSync);
            window.removeEventListener('building:visited', handleBuildingVisit);

            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [scheduleSync]);

    // Cleanup on unmount - perform final sync
    useEffect(() => {
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
                // Perform immediate sync on unmount
                performSync();
            }
        };
    }, [performSync]);
}

export default useConvexSync;
