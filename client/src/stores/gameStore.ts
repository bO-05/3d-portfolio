/**
 * Zustand game store for state management
 * Manages player, game, UI, and settings state
 * @module stores/gameStore
 */

import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface PlayerState {
    position: Vector3;
    rotation: number;
    speed: number;
    insideBuilding: string | null;
}

interface GameState {
    isLoading: boolean;
    isPaused: boolean;
    timeOfDay: 'day' | 'evening' | 'night';
    visitedBuildings: string[];
    secretsFound: number;
    totalSecrets: number;
    sessionStart: number;
}

interface UIState {
    showHUD: boolean;
    showMinimap: boolean;
    showChat: boolean;
    showModal: boolean;
    showMobileControls: boolean;
    showControlsTooltip: boolean;
    showJournal: boolean;
    currentDialogue: string | null;
}

interface SettingsState {
    soundEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    graphicsQuality: 'low' | 'medium' | 'high';
}

interface VehicleState {
    engineOn: boolean;
    headlightsOn: boolean;
    isBoosting: boolean;
}

interface GameStore {
    // Player state
    player: PlayerState;
    setPlayerPosition: (pos: Vector3) => void;
    setPlayerSpeed: (speed: number) => void;
    enterBuilding: (buildingId: string) => void;
    exitBuilding: () => void;

    // Game state
    game: GameState;
    setLoading: (isLoading: boolean) => void;
    togglePause: () => void;
    setTimeOfDay: (time: 'day' | 'evening' | 'night') => void;
    markBuildingVisited: (buildingId: string) => void;
    foundSecret: () => void;

    // UI state
    ui: UIState;
    openChat: () => void;
    closeChat: () => void;
    setDialogue: (dialogue: string | null) => void;
    clearDialogue: () => void;
    setMobileControls: (show: boolean) => void;
    showControlsTooltip: () => void;
    hideControlsTooltip: () => void;
    openJournal: () => void;
    closeJournal: () => void;
    toggleJournal: () => void;

    // Social state
    whispers: Array<{ text: string; location: string; timestamp: number }>;
    visitorCount: number;
    setWhispers: (whispers: Array<{ text: string; location: string; timestamp: number }>) => void;
    setVisitorCount: (count: number) => void;

    // Settings
    settings: SettingsState;
    updateSettings: (newSettings: Partial<SettingsState>) => void;

    // Vehicle state
    vehicle: VehicleState;
    toggleEngine: () => void;
    toggleHeadlights: () => void;
    setBoosting: (boosting: boolean) => void;
}

// ─────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set) => ({
    // ─────────────────────────────────────────────────────────────
    // PLAYER STATE
    // ─────────────────────────────────────────────────────────────
    player: {
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        speed: 0,
        insideBuilding: null,
    },

    setPlayerPosition: (pos) =>
        set((state) => ({
            player: { ...state.player, position: pos },
        })),

    setPlayerSpeed: (speed) =>
        set((state) => ({
            player: { ...state.player, speed },
        })),

    enterBuilding: (buildingId) =>
        set((state) => ({
            player: { ...state.player, insideBuilding: buildingId },
            ui: {
                ...state.ui,
                showModal: buildingId !== 'warung',
                showChat: buildingId === 'warung',
            },
        })),

    exitBuilding: () =>
        set((state) => ({
            player: { ...state.player, insideBuilding: null },
            ui: { ...state.ui, showModal: false, showChat: false },
        })),

    // ─────────────────────────────────────────────────────────────
    // GAME STATE
    // ─────────────────────────────────────────────────────────────
    game: {
        isLoading: true,
        isPaused: false,
        timeOfDay: 'day',
        visitedBuildings: [],
        secretsFound: 0,
        totalSecrets: 5,
        sessionStart: performance.now(),
    },

    setLoading: (isLoading) =>
        set((state) => ({
            game: { ...state.game, isLoading },
        })),

    togglePause: () =>
        set((state) => ({
            game: { ...state.game, isPaused: !state.game.isPaused },
        })),

    setTimeOfDay: (time) =>
        set((state) => ({
            game: { ...state.game, timeOfDay: time },
        })),

    markBuildingVisited: (buildingId) =>
        set((state) => ({
            game: {
                ...state.game,
                visitedBuildings: [...new Set([...state.game.visitedBuildings, buildingId])],
            },
        })),

    foundSecret: () =>
        set((state) => ({
            game: { ...state.game, secretsFound: state.game.secretsFound + 1 },
        })),

    // ─────────────────────────────────────────────────────────────
    // UI STATE
    // ─────────────────────────────────────────────────────────────
    ui: {
        showHUD: true,
        showMinimap: true,
        showChat: false,
        showModal: false,
        showMobileControls: false,
        showControlsTooltip: false,
        showJournal: false,
        currentDialogue: null,
    },

    openChat: () =>
        set((state) => ({
            ui: { ...state.ui, showChat: true },
        })),

    closeChat: () =>
        set((state) => ({
            ui: { ...state.ui, showChat: false },
        })),

    setDialogue: (dialogue) =>
        set((state) => ({
            ui: { ...state.ui, currentDialogue: dialogue },
        })),

    clearDialogue: () =>
        set((state) => ({
            ui: { ...state.ui, currentDialogue: null },
        })),

    setMobileControls: (show) =>
        set((state) => ({
            ui: { ...state.ui, showMobileControls: show },
        })),

    showControlsTooltip: () =>
        set((state) => ({
            ui: { ...state.ui, showControlsTooltip: true },
        })),

    hideControlsTooltip: () =>
        set((state) => ({
            ui: { ...state.ui, showControlsTooltip: false },
        })),

    openJournal: () =>
        set((state) => ({
            ui: { ...state.ui, showJournal: true },
        })),

    closeJournal: () =>
        set((state) => ({
            ui: { ...state.ui, showJournal: false },
        })),

    toggleJournal: () =>
        set((state) => ({
            ui: { ...state.ui, showJournal: !state.ui.showJournal },
        })),

    // ─────────────────────────────────────────────────────────────
    // SOCIAL STATE
    // ─────────────────────────────────────────────────────────────
    whispers: [],
    visitorCount: 0,

    setWhispers: (whispers) => set({ whispers }),
    setVisitorCount: (count) => set({ visitorCount: count }),

    // ─────────────────────────────────────────────────────────────
    // SETTINGS
    // ─────────────────────────────────────────────────────────────
    settings: {
        soundEnabled: true,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        graphicsQuality: 'high',
    },

    updateSettings: (newSettings) =>
        set((state) => ({
            settings: { ...state.settings, ...newSettings },
        })),

    // ─────────────────────────────────────────────────────────────
    // VEHICLE STATE
    // ─────────────────────────────────────────────────────────────
    vehicle: {
        engineOn: false,
        headlightsOn: false,
        isBoosting: false,
    },

    toggleEngine: () =>
        set((state) => {
            const newEngineState = !state.vehicle.engineOn;
            console.log(`[Vehicle] Engine ${newEngineState ? 'ON' : 'OFF'}`);
            return {
                vehicle: { ...state.vehicle, engineOn: newEngineState },
            };
        }),

    toggleHeadlights: () =>
        set((state) => {
            const newLightState = !state.vehicle.headlightsOn;
            console.log(`[Vehicle] Headlights ${newLightState ? 'ON' : 'OFF'}`);
            return {
                vehicle: { ...state.vehicle, headlightsOn: newLightState },
            };
        }),

    setBoosting: (boosting) =>
        set((state) => ({
            vehicle: { ...state.vehicle, isBoosting: boosting },
        })),
}));
