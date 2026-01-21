/**
 * Collectible Store - Optimized for zero-lag collection
 * Uses deferred localStorage writes and async PostHog tracking
 * @module stores/collectibleStore
 */

import { create } from 'zustand';

// All collectible IDs for calculating progress
const ALL_COLLECTIBLE_IDS = [
    'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8',
    'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15'
];

const STORAGE_KEY = 'jakarta-collectibles';

// Load initial state from localStorage (once on startup)
const loadFromStorage = (): { collected: Set<string>; revealedBoxes: Set<string> } => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return {
                collected: new Set(data.collected || []),
                revealedBoxes: new Set(data.revealedBoxes || []),
            };
        }
    } catch (e) {
        console.warn('Failed to load collectibles from storage:', e);
    }
    return { collected: new Set(), revealedBoxes: new Set() };
};

// Debounced save to localStorage (non-blocking)
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const deferredSave = (collected: Set<string>, revealedBoxes: Set<string>) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                collected: Array.from(collected),
                revealedBoxes: Array.from(revealedBoxes),
            }));
        } catch (e) {
            console.warn('Failed to save collectibles:', e);
        }
    }, 500); // Debounce 500ms - batches rapid collections
};

// Deferred PostHog tracking (non-blocking)
const trackCollection = (id: string, totalCollected: number) => {
    // Use requestIdleCallback if available, else setTimeout
    const defer = window.requestIdleCallback || ((cb: Function) => setTimeout(cb, 0));
    defer(() => {
        if ((window as any).posthog) {
            (window as any).posthog.capture('collectible_picked_up', {
                id,
                total_collected: totalCollected,
            });
        }
    });
};

interface CollectibleState {
    collected: Set<string>;
    revealedBoxes: Set<string>;
    collect: (id: string) => void;
    revealBox: (id: string) => void;
    isCollected: (id: string) => boolean;
    isBoxRevealed: (id: string) => boolean;
    getProgress: () => { collected: number; total: number; percent: number };
    resetSignal: number;
    reset: () => void;
}

// Initialize from storage
const initialState = loadFromStorage();

export const useCollectibleStore = create<CollectibleState>((set, get) => ({
    collected: initialState.collected,
    revealedBoxes: initialState.revealedBoxes,

    collect: (id: string) => {
        const { collected, revealedBoxes } = get();
        if (!collected.has(id)) {
            // Mutate the Set (no new reference = minimal re-render)
            collected.add(id);
            // Trigger re-render with same Set reference but new object
            set({ collected: new Set(collected) });

            // Emit event for audio/visual feedback (decoupled from store)
            window.dispatchEvent(new CustomEvent('collectible:pickup', {
                detail: { id, total: collected.size }
            }));

            // Emit sync event for Convex backend (non-blocking)
            window.dispatchEvent(new CustomEvent('collectible:sync'));

            // Deferred save (non-blocking)
            deferredSave(collected, revealedBoxes);

            // Deferred tracking (non-blocking)
            trackCollection(id, collected.size);
        }
    },

    revealBox: (id: string) => {
        const { collected, revealedBoxes } = get();
        if (!revealedBoxes.has(id)) {
            revealedBoxes.add(id);
            set({ revealedBoxes: new Set(revealedBoxes) });
            deferredSave(collected, revealedBoxes);
        }
    },

    isCollected: (id: string) => {
        return get().collected.has(id); // Set.has() is O(1)
    },

    isBoxRevealed: (id: string) => {
        return get().revealedBoxes.has(id);
    },

    getProgress: () => {
        const collected = get().collected.size;
        const total = ALL_COLLECTIBLE_IDS.length;
        return {
            collected,
            total,
            percent: Math.round((collected / total) * 100),
        };
    },

    resetSignal: 0,

    reset: () => {
        // Cancel any pending debounced save to prevent race condition
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }

        set((state) => ({
            collected: new Set(),
            revealedBoxes: new Set(),
            resetSignal: state.resetSignal + 1
        }));

        // Write empty state explicitly (not removeItem) to ensure atomicity
        // This prevents any delayed saves from restoring stale data
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            collected: [],
            revealedBoxes: []
        }));

        // Emit sync event to clear server data immediately (not debounced)
        window.dispatchEvent(new CustomEvent('collectible:sync'));
    },
}));

export default useCollectibleStore;
