/**
 * Speedrun Store - Manages timed collectible challenge state
 * 
 * Flow:
 * 1. Player enters zone → phase: 'ready'
 * 2. Player enters initials → phase: 'countdown'  
 * 3. Countdown ends → phase: 'running', timer starts
 * 4. All collectibles collected → phase: 'completed'
 * 5. Score submitted → phase: 'submitted'
 * 
 * @module stores/speedrunStore
 */

import { create } from 'zustand';

export type SpeedrunPhase = 'idle' | 'ready' | 'entering_initials' | 'countdown' | 'running' | 'completed' | 'submitted';

interface SpeedrunState {
    /** Current phase of the speedrun */
    phase: SpeedrunPhase;
    /** Player's 3-character initials */
    playerInitials: string;
    /** Timestamp when timer started */
    startTime: number | null;
    /** Timestamp when timer stopped */
    endTime: number | null;
    /** Final time in milliseconds */
    finalTime: number | null;
    /** Countdown value (3, 2, 1, GO) */
    countdown: number;
    /** Rank after submission */
    rank: number | null;
    /** Collectibles collected during THIS speedrun (separate from permanent progress) */
    speedrunCollected: Set<string>;
    /** Pre-speedrun collectible state (to restore after run) */
    savedCollectibles: string[] | null;
}

interface SpeedrunActions {
    /** Player enters the speedrun zone */
    enterZone: () => void;
    /** Player leaves the speedrun zone */
    leaveZone: () => void;
    /** Start entering initials */
    startInitialsInput: () => void;
    /** Set player initials (max 3 chars) */
    setInitials: (initials: string) => void;
    /** Begin countdown */
    startCountdown: () => void;
    /** Decrement countdown */
    tickCountdown: () => void;
    /** Start the timer (countdown finished) */
    startRun: (permanentCollected: string[]) => void;
    /** Collect an item during speedrun (isolated tracking) */
    collectSpeedrunItem: (id: string) => void;
    /** Stop the timer (all collectibles collected) */
    completeRun: () => void;
    /** Mark as submitted with rank */
    markSubmitted: (rank: number) => void;
    /** Reset to idle state and restore permanent collectibles */
    reset: () => void;
    /** Get elapsed time in ms (for display) */
    getElapsedTime: () => number;
    /** Get speedrun collected count */
    getSpeedrunCollectedCount: () => number;
}

const initialState: SpeedrunState = {
    phase: 'idle',
    playerInitials: '',
    startTime: null,
    endTime: null,
    finalTime: null,
    countdown: 3,
    rank: null,
    speedrunCollected: new Set(),
    savedCollectibles: null,
};

export const useSpeedrunStore = create<SpeedrunState & SpeedrunActions>((set, get) => ({
    ...initialState,

    enterZone: () => {
        const { phase } = get();
        if (phase === 'idle') {
            set({ phase: 'ready' });
        }
    },

    leaveZone: () => {
        const { phase } = get();
        if (phase === 'ready') {
            set({ phase: 'idle' });
        }
    },

    startInitialsInput: () => {
        set({ phase: 'entering_initials' });
    },

    setInitials: (initials: string) => {
        // Sanitize: uppercase, max 3 chars, alphanumeric only
        const sanitized = initials
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 3);
        set({ playerInitials: sanitized });
    },

    startCountdown: () => {
        const { playerInitials } = get();
        if (playerInitials.length >= 1) {
            set({ phase: 'countdown', countdown: 3 });
        }
    },

    tickCountdown: () => {
        const { countdown } = get();
        if (countdown > 0) {
            set({ countdown: countdown - 1 });
        }
    },

    startRun: (permanentCollected: string[]) => {
        set({
            phase: 'running',
            startTime: Date.now(),
            endTime: null,
            finalTime: null,
            speedrunCollected: new Set(), // Start fresh
            savedCollectibles: permanentCollected, // Save for restoration later
        });
    },

    collectSpeedrunItem: (id: string) => {
        const { speedrunCollected, phase } = get();
        if (phase !== 'running') return;

        if (!speedrunCollected.has(id)) {
            const newCollected = new Set(speedrunCollected);
            newCollected.add(id);
            set({ speedrunCollected: newCollected });
        }
    },

    completeRun: () => {
        const { startTime, phase } = get();
        if (phase !== 'running' || !startTime) return;

        const endTime = Date.now();
        const finalTime = endTime - startTime;

        set({
            phase: 'completed',
            endTime,
            finalTime,
        });
    },

    markSubmitted: (rank: number) => {
        set({ phase: 'submitted', rank });
    },

    reset: () => {
        set({
            phase: 'idle',
            playerInitials: '',
            startTime: null,
            endTime: null,
            finalTime: null,
            countdown: 3,
            rank: null,
            speedrunCollected: new Set(),
            savedCollectibles: null,
        });
    },

    getElapsedTime: () => {
        const { startTime, endTime, phase } = get();
        if (!startTime) return 0;

        if (phase === 'completed' || phase === 'submitted') {
            return endTime ? endTime - startTime : 0;
        }

        return Date.now() - startTime;
    },

    getSpeedrunCollectedCount: () => {
        return get().speedrunCollected.size;
    },
}));

/**
 * Format time as MM:SS.mmm
 */
export function formatSpeedrunTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export default useSpeedrunStore;
