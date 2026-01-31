/**
 * Zustand graphics store for WebGL settings management
 * Manages quality tiers, DPR, shadows, and effects with auto-detection
 * @module stores/graphicsStore
 */

import { create } from 'zustand';
import {
    type QualityTier,
    detectDeviceTier,
    getRecommendedDPR,
    shouldEnableShadows,
    shouldEnableEffects,
    shouldEnableAntialias,
} from '../utils/deviceDetection';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'graphics-settings';

// ─────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────

interface GraphicsState {
    qualityTier: QualityTier;
    dpr: number;
    shadowsEnabled: boolean;
    antialias: boolean;
    effectsEnabled: boolean;
    autoDetected: boolean;
}

interface GraphicsStore extends GraphicsState {
    setQualityTier: (tier: QualityTier) => void;
    autoDetectQuality: () => void;
    setDPR: (value: number) => void;
    toggleShadows: () => void;
    toggleEffects: () => void;
    toggleAntialias: () => void;
    resetToDefaults: () => void;
}

// ─────────────────────────────────────────────────────────────
// Persistence Helpers
// ─────────────────────────────────────────────────────────────

function loadFromStorage(): Partial<GraphicsState> | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as Partial<GraphicsState>;
    } catch {
        return null;
    }
}

function saveToStorage(state: GraphicsState): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

function getAutoDetectedDefaults(): GraphicsState {
    return {
        qualityTier: detectDeviceTier(),
        dpr: getRecommendedDPR(),
        shadowsEnabled: shouldEnableShadows(),
        antialias: shouldEnableAntialias(),
        effectsEnabled: shouldEnableEffects(),
        autoDetected: true,
    };
}

function getInitialState(): GraphicsState {
    const stored = loadFromStorage();
    if (stored && !stored.autoDetected) {
        // User has manual overrides, use them but fill in any missing values
        const defaults = getAutoDetectedDefaults();
        return {
            ...defaults,
            ...stored,
            autoDetected: false,
        };
    }
    return getAutoDetectedDefaults();
}

// ─────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────

export const useGraphicsStore = create<GraphicsStore>((set) => ({
    // ─────────────────────────────────────────────────────────────
    // INITIAL STATE
    // ─────────────────────────────────────────────────────────────
    ...getInitialState(),

    // ─────────────────────────────────────────────────────────────
    // ACTIONS
    // ─────────────────────────────────────────────────────────────

    setQualityTier: (tier: QualityTier) => {
        set((state) => {
            // Safe accessor for devicePixelRatio (SSR/test environments)
            const nativeDPR =
                typeof window !== 'undefined' && window.devicePixelRatio !== undefined
                    ? window.devicePixelRatio
                    : 1;

            let newState: GraphicsState;

            switch (tier) {
                case 'low':
                    newState = {
                        qualityTier: 'low',
                        dpr: 1,
                        shadowsEnabled: false,
                        antialias: false,
                        effectsEnabled: false,
                        autoDetected: false,
                    };
                    break;
                case 'medium':
                    newState = {
                        qualityTier: 'medium',
                        dpr: Math.min(nativeDPR, 1.5),
                        shadowsEnabled: true,
                        antialias: true,
                        effectsEnabled: false,
                        autoDetected: false,
                    };
                    break;
                case 'high':
                    newState = {
                        qualityTier: 'high',
                        dpr: Math.min(nativeDPR, 2),
                        shadowsEnabled: true,
                        antialias: true,
                        effectsEnabled: true,
                        autoDetected: false,
                    };
                    break;
                default:
                    return state;
            }

            saveToStorage(newState);
            return newState;
        });
    },

    autoDetectQuality: () => {
        const newState = getAutoDetectedDefaults();
        saveToStorage(newState);
        set(newState);
    },

    setDPR: (value: number) => {
        set((state) => {
            const clampedValue = Math.max(0.5, Math.min(3, value));
            const newState: GraphicsState = {
                ...state,
                dpr: clampedValue,
                autoDetected: false,
            };
            saveToStorage(newState);
            return newState;
        });
    },

    toggleShadows: () => {
        set((state) => {
            const newState: GraphicsState = {
                ...state,
                shadowsEnabled: !state.shadowsEnabled,
                autoDetected: false,
            };
            saveToStorage(newState);
            return newState;
        });
    },

    toggleEffects: () => {
        set((state) => {
            const newState: GraphicsState = {
                ...state,
                effectsEnabled: !state.effectsEnabled,
                autoDetected: false,
            };
            saveToStorage(newState);
            return newState;
        });
    },

    toggleAntialias: () => {
        set((state) => {
            const newState: GraphicsState = {
                ...state,
                antialias: !state.antialias,
                autoDetected: false,
            };
            saveToStorage(newState);
            return newState;
        });
    },

    resetToDefaults: () => {
        const newState = getAutoDetectedDefaults();
        saveToStorage(newState);
        set(newState);
    },
}));
