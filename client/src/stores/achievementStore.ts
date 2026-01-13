/**
 * Achievement Store - Tracks unlocked achievements
 * @module stores/achievementStore
 */

import { create } from 'zustand';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';

const STORAGE_KEY = 'jakarta-achievements';

// Load from localStorage
const loadFromStorage = (): Set<string> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.warn('Failed to load achievements:', e);
    }
    return new Set();
};

// Debounced save
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const deferredSave = (unlocked: Set<string>) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
        } catch (e) {
            console.warn('Failed to save achievements:', e);
        }
    }, 500);
};

interface AchievementState {
    unlocked: Set<string>;
    pendingToast: Achievement | null;

    // Stats for achievement conditions
    engineToggles: number;
    boostSeconds: number;

    unlock: (id: string) => void;
    clearToast: () => void;
    incrementEngineToggle: () => void;
    addBoostTime: (seconds: number) => void;
    isUnlocked: (id: string) => boolean;
    getProgress: () => { unlocked: number; total: number };
}

const initialUnlocked = loadFromStorage();

export const useAchievementStore = create<AchievementState>((set, get) => ({
    unlocked: initialUnlocked,
    pendingToast: null,
    engineToggles: 0,
    boostSeconds: 0,

    unlock: (id: string) => {
        const { unlocked } = get();
        if (!unlocked.has(id)) {
            const newUnlocked = new Set(unlocked);
            newUnlocked.add(id);

            const achievement = ACHIEVEMENTS.find(a => a.id === id);

            set({
                unlocked: newUnlocked,
                pendingToast: achievement || null,
            });

            deferredSave(newUnlocked);

            // Track in PostHog
            if ((window as any).posthog) {
                (window as any).posthog.capture('achievement_unlocked', { id });
            }
        }
    },

    clearToast: () => set({ pendingToast: null }),

    incrementEngineToggle: () => {
        const { engineToggles } = get();
        set({ engineToggles: engineToggles + 1 });
    },

    addBoostTime: (seconds: number) => {
        const { boostSeconds } = get();
        set({ boostSeconds: boostSeconds + seconds });
    },

    isUnlocked: (id: string) => get().unlocked.has(id),

    getProgress: () => ({
        unlocked: get().unlocked.size,
        total: ACHIEVEMENTS.length,
    }),
}));

export default useAchievementStore;
