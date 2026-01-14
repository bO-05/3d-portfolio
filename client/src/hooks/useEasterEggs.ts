/**
 * useEasterEggs Hook - Hidden surprises activated by secret inputs
 * 
 * Easter Eggs:
 * 1. Konami Code (↑↑↓↓←→←→BA) - Rainbow Bajaj
 * 2. Disco Mode (Type "disco") - Flashing lights
 * 3. Speed Run (Type "speedrun") - Timer appears
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

interface EasterEggState {
    konamiActive: boolean;
    discoActive: boolean;
    speedRunActive: boolean;
    speedRunStart: number | null;
}

// Store easter egg state globally (not in Zustand to avoid re-renders)
let easterEggState: EasterEggState = {
    konamiActive: false,
    discoActive: false,
    speedRunActive: false,
    speedRunStart: null,
};

// Callbacks for UI updates
const listeners: Set<() => void> = new Set();

const notifyListeners = () => {
    listeners.forEach(fn => fn());
};

export function getEasterEggState() {
    return easterEggState;
}

export function subscribeToEasterEggs(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

export function useEasterEggs() {
    const konamiIndex = useRef(0);
    const textBuffer = useRef('');
    const textTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activateKonami = useCallback(() => {
        easterEggState.konamiActive = true;
        notifyListeners();

        // Track in PostHog
        if ((window as any).posthog) {
            (window as any).posthog.capture('easter_egg_activated', { type: 'konami' });
        }

        console.log('🎮 KONAMI CODE ACTIVATED! Rainbow Bajaj enabled!');
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
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
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

                // Reset buffer after 2 seconds of inactivity
                if (textTimeout.current) clearTimeout(textTimeout.current);
                textTimeout.current = setTimeout(() => {
                    textBuffer.current = '';
                }, 2000);

                // Check for commands
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
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activateKonami, activateDisco, activateSpeedRun]);
}

export default useEasterEggs;
