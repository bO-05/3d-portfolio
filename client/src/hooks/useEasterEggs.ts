/**
 * useEasterEggs Hook - Hidden surprises activated by secret inputs
 * 
 * Easter Eggs:
 * 1. Konami Code (↑↑↓↓←→←→BA) - Swap Bajaj to TransJakarta
 * 2. Disco Mode (Type "disco") - Flashing lights
 * 3. Speed Run (Type "speedrun") - Timer appears
 * 4. Honk Wheelie (Honk 5x in 3s) - Vehicle tilts back
 * 5. Circle Music Studio 5x - Confetti burst
 * 6. Jakarta Sky (Day + all buildings) - Beautiful sky.webp
 * 
 * @module hooks/useEasterEggs
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

// Konami Code sequence
const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

// Music studio position for circle tracking
const MUSIC_STUDIO_CENTER = { x: 25, z: 25 };
const CIRCLE_RADIUS_MIN = 5;
const CIRCLE_RADIUS_MAX = 50;
const CIRCLES_REQUIRED = 5;

interface EasterEggState {
    // Konami - vehicle swap
    konamiActive: boolean;
    vehicleSwapped: boolean;

    // Disco mode
    discoActive: boolean;

    // Speed run timer
    speedRunActive: boolean;
    speedRunStart: number | null;

    // Honk wheelie
    wheelieActive: boolean;
    wheelieStartTime: number | null;

    // Circle confetti
    confettiActive: boolean;

    // Jakarta Sky
    jakartaSkyActive: boolean;
    jakartaSkyToggleVisible: boolean;
}

// Store easter egg state globally (not in Zustand to avoid re-renders)
let easterEggState: EasterEggState = {
    konamiActive: false,
    vehicleSwapped: false,
    discoActive: false,
    speedRunActive: false,
    speedRunStart: null,
    wheelieActive: false,
    wheelieStartTime: null,
    confettiActive: false,
    jakartaSkyActive: false,
    jakartaSkyToggleVisible: false,
};

// Honk tracking
let honkTimestamps: number[] = [];

// Circle tracking
let circleState = {
    lastAngle: 0,
    totalRotation: 0,
    lastUpdateTime: 0,
    isTracking: false,
};

// Callbacks for UI updates
const listeners: Set<() => void> = new Set();

// CACHED SNAPSHOT - prevents infinite re-renders
// Only updated when notifyListeners is called (i.e., state actually changed)
let cachedSnapshot: Readonly<EasterEggState> = Object.freeze({ ...easterEggState });

const notifyListeners = () => {
    // Create new snapshot ONLY when state changes
    cachedSnapshot = Object.freeze({ ...easterEggState });
    listeners.forEach(fn => fn());
};

export function getEasterEggState(): Readonly<EasterEggState> {
    // Return cached snapshot - same reference until state changes
    return cachedSnapshot;
}

export function subscribeToEasterEggs(callback: () => void): () => void {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
}

// Called when honk key is pressed
export function registerHonk() {
    const now = Date.now();
    honkTimestamps.push(now);

    // Keep only honks from last 3 seconds
    honkTimestamps = honkTimestamps.filter(t => now - t < 3000);

    // Check if 5 honks in 3 seconds
    if (honkTimestamps.length >= 5) {
        activateWheelie();
        honkTimestamps = []; // Reset
    }
}

function activateWheelie() {
    if (easterEggState.wheelieActive) return;

    easterEggState.wheelieActive = true;
    easterEggState.wheelieStartTime = Date.now();
    notifyListeners();

    if ((window as any).posthog) {
        (window as any).posthog.capture('easter_egg_activated', { type: 'wheelie' });
    }

    console.log('🏍️ WHEELIE! Vehicle tilting back!');

    // Auto-reset after 1.5 seconds
    setTimeout(() => {
        easterEggState.wheelieActive = false;
        easterEggState.wheelieStartTime = null;
        notifyListeners();
    }, 1500);
}

// Called to update circle tracking based on player position
// Throttled to 200ms to reduce unnecessary trig calculations
const CIRCLE_TRACK_THROTTLE = 200;
let lastCircleTrackTime = 0;

export function updateCircleTracking(px: number, pz: number) {
    const now = Date.now();

    // Throttle updates to every 200ms
    if (now - lastCircleTrackTime < CIRCLE_TRACK_THROTTLE) {
        return;
    }
    lastCircleTrackTime = now;

    // Calculate distance from music studio center
    const dx = px - MUSIC_STUDIO_CENTER.x;
    const dz = pz - MUSIC_STUDIO_CENTER.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Check if within valid circle range
    if (distance < CIRCLE_RADIUS_MIN || distance > CIRCLE_RADIUS_MAX) {
        // Reset if too far or too close
        if (circleState.isTracking && now - circleState.lastUpdateTime > 10000) {
            circleState.totalRotation = 0;
            circleState.isTracking = false;
        }
        return;
    }

    // Calculate current angle
    const currentAngle = Math.atan2(dz, dx);

    if (!circleState.isTracking) {
        // Start tracking
        circleState.lastAngle = currentAngle;
        circleState.isTracking = true;
        circleState.lastUpdateTime = now;
        return;
    }

    // Calculate angle delta (handle wraparound)
    let delta = currentAngle - circleState.lastAngle;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    circleState.totalRotation += delta;
    circleState.lastAngle = currentAngle;
    circleState.lastUpdateTime = now;

    // Check if completed required circles (5 full rotations = 10π)
    const requiredRadians = CIRCLES_REQUIRED * 2 * Math.PI;
    if (Math.abs(circleState.totalRotation) >= requiredRadians) {
        activateConfetti();
        circleState.totalRotation = 0; // Reset
    }
}

function activateConfetti() {
    if (easterEggState.confettiActive) return;

    easterEggState.confettiActive = true;
    notifyListeners();

    if ((window as any).posthog) {
        (window as any).posthog.capture('easter_egg_activated', { type: 'confetti' });
    }

    console.log('🎊 CONFETTI! You circled the music studio 5 times!');

    // Auto-reset after 3 seconds
    setTimeout(() => {
        easterEggState.confettiActive = false;
        notifyListeners();
    }, 3000);
}

// Check Jakarta Sky condition (called externally)
// FIXED: Unlocks at ANY time of day once 5 buildings visited
export function checkJakartaSky(visitedCount: number) {
    // Only require visiting all 5 buildings, works at any time of day
    const shouldActivate = visitedCount >= 5;

    if (shouldActivate && !easterEggState.jakartaSkyToggleVisible) {
        easterEggState.jakartaSkyToggleVisible = true;
        easterEggState.jakartaSkyActive = true;
        notifyListeners();

        if ((window as any).posthog) {
            (window as any).posthog.capture('easter_egg_activated', { type: 'jakarta_sky' });
        }

        console.log('🌅 JAKARTA SKY UNLOCKED! Beautiful sky activated!');
    }
}

// Toggle Jakarta Sky manually
export function toggleJakartaSky() {
    if (easterEggState.jakartaSkyToggleVisible) {
        easterEggState.jakartaSkyActive = !easterEggState.jakartaSkyActive;
        notifyListeners();
    }
}

export function useEasterEggs() {
    const konamiIndex = useRef(0);
    const textBuffer = useRef('');
    const textTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Subscribe to game state for Jakarta Sky check
    const visitedBuildings = useGameStore((state) => state.game.visitedBuildings);
    const playerPosition = useGameStore((state) => state.player.position);

    // Check Jakarta Sky condition (no longer depends on timeOfDay)
    useEffect(() => {
        checkJakartaSky(visitedBuildings.length);
    }, [visitedBuildings.length]);

    // Update circle tracking based on position
    useEffect(() => {
        updateCircleTracking(playerPosition.x, playerPosition.z);
    }, [playerPosition.x, playerPosition.z]);

    const activateKonami = useCallback(() => {
        easterEggState.konamiActive = true;
        easterEggState.vehicleSwapped = !easterEggState.vehicleSwapped;
        notifyListeners();

        if ((window as any).posthog) {
            (window as any).posthog.capture('easter_egg_activated', {
                type: 'konami',
                vehicleSwapped: easterEggState.vehicleSwapped
            });
        }

        console.log(`🎮 KONAMI CODE ACTIVATED! Vehicle: ${easterEggState.vehicleSwapped ? 'TransJakarta' : 'Bajaj'}`);
    }, []);

    const activateDisco = useCallback(() => {
        easterEggState.discoActive = !easterEggState.discoActive;
        notifyListeners();

        if ((window as any).posthog) {
            (window as any).posthog.capture('easter_egg_activated', { type: 'disco' });
        }

        console.log(`🪩 DISCO MODE ${easterEggState.discoActive ? 'ON' : 'OFF'}!`);
    }, []);

    const activateSpeedRun = useCallback(() => {
        easterEggState.speedRunActive = !easterEggState.speedRunActive;
        if (easterEggState.speedRunActive) {
            easterEggState.speedRunStart = Date.now();
            console.log('⏱️ SPEED RUN MODE STARTED!');
        } else {
            console.log('⏱️ SPEED RUN MODE STOPPED!');
        }
        notifyListeners();

        if ((window as any).posthog) {
            (window as any).posthog.capture('easter_egg_activated', { type: 'speedrun' });
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target instanceof HTMLElement && e.target.isContentEditable)
            ) {
                return;
            }

            // Register honk for wheelie detection (Spacebar is honk)
            if (e.code === 'Space') {
                registerHonk();
            }

            // Konami Code detection
            if (e.code === KONAMI_CODE[konamiIndex.current]) {
                konamiIndex.current++;
                if (konamiIndex.current === KONAMI_CODE.length) {
                    activateKonami();
                    konamiIndex.current = 0;
                }
            } else {
                konamiIndex.current = 0;
            }

            // Text command detection (disco, speedrun)
            if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                textBuffer.current += e.key.toLowerCase();

                if (textTimeout.current) clearTimeout(textTimeout.current);
                textTimeout.current = setTimeout(() => {
                    textBuffer.current = '';
                }, 2000);

                if (textBuffer.current.endsWith('disco')) {
                    activateDisco();
                    textBuffer.current = '';
                }
                if (textBuffer.current.endsWith('speedrun')) {
                    activateSpeedRun();
                    textBuffer.current = '';
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (textTimeout.current) {
                clearTimeout(textTimeout.current);
                textTimeout.current = null;
            }
        };
    }, [activateKonami, activateDisco, activateSpeedRun]);
}

export default useEasterEggs;
