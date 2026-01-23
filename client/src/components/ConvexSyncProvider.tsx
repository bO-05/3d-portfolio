/**
 * Convex Sync Provider
 * Wrapper component that initializes cross-device progress sync
 * Only renders when Convex is configured
 * @module components/ConvexSyncProvider
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useVisitorId } from '../hooks/useVisitorId';
import { useCollectibleStore } from '../stores/collectibleStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useGameStore } from '../stores/gameStore';

// Debounce delay for batching rapid updates
const SYNC_DEBOUNCE_MS = 500;

/**
 * Provider component that manages bidirectional sync with Convex backend
 * Should be rendered as a child of ConvexProvider
 */
export function ConvexSyncProvider({ children }: { children: React.ReactNode }) {
    const visitorId = useVisitorId();

    // Convex mutations and queries
    const syncProgress = useMutation(api.progress.syncProgress);
    const serverProgress = useQuery(api.progress.getProgress, { visitorId });

    // Debounce timer ref
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasMergedRef = useRef(false);

    /**
     * Merge server state with local state on initial load
     * Only runs once when server data arrives
     */
    useEffect(() => {
        if (!serverProgress || hasMergedRef.current) return;

        hasMergedRef.current = true;

        // Get current local state
        const localCollectibles = useCollectibleStore.getState().collected;
        const localAchievements = useAchievementStore.getState().unlocked;
        const localBuildings = useGameStore.getState().game.visitedBuildings;

        // Merge with server state (union of both)
        const mergedCollectibles = new Set([
            ...localCollectibles,
            ...serverProgress.collectibles,
        ]);
        const mergedAchievements = new Set([
            ...localAchievements,
            ...serverProgress.achievements,
        ]);
        const mergedBuildings = [...new Set([
            ...localBuildings,
            ...serverProgress.visitedBuildings,
        ])];

        // Update local stores if server had more data
        if (mergedCollectibles.size > localCollectibles.size) {
            useCollectibleStore.setState({ collected: mergedCollectibles });
        }
        if (mergedAchievements.size > localAchievements.size) {
            useAchievementStore.setState({ unlocked: mergedAchievements });
        }
        if (mergedBuildings.length > localBuildings.length) {
            // Update visited buildings in gameStore
            useGameStore.setState((state) => ({
                game: { ...state.game, visitedBuildings: mergedBuildings },
            }));
        }

        console.log('[ConvexSync] Merged server progress:', {
            collectibles: mergedCollectibles.size,
            achievements: mergedAchievements.size,
            buildings: mergedBuildings.length,
        });
    }, [serverProgress]);

    /**
     * Debounced sync function - uploads current state to server
     */
    const performSync = useCallback(async () => {
        const collectibles = Array.from(useCollectibleStore.getState().collected);
        const achievements = Array.from(useAchievementStore.getState().unlocked);
        const visitedBuildings = useGameStore.getState().game.visitedBuildings;

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
    }, [visitorId, syncProgress]);

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
        const handleSync = () => scheduleSync();

        // Subscribe to custom events emitted by stores
        window.addEventListener('collectible:sync', handleSync);
        window.addEventListener('achievement:sync', handleSync);
        window.addEventListener('building:visited', handleSync);

        return () => {
            window.removeEventListener('collectible:sync', handleSync);
            window.removeEventListener('achievement:sync', handleSync);
            window.removeEventListener('building:visited', handleSync);

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

    return <>{children}</>;
}

export default ConvexSyncProvider;
