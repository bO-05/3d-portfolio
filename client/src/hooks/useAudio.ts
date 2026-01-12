/**
 * useAudio Hook - Audio management with Howler.js
 * Engine sound with different states: idle, moving, boosting
 * @module hooks/useAudio
 */

import { useRef, useCallback, useEffect } from 'react';
import { Howl } from 'howler';
import { useGameStore } from '../stores/gameStore';
import { useKeyboard } from './useKeyboard';

// Preload sounds - FIXED PATH: /sounds/ (plural)
const engineSound = new Howl({
    src: ['/sounds/engine.mp3'],
    loop: true,
    volume: 0.4,
});

const honkSound = new Howl({
    src: ['/sounds/honk.mp3'],
    volume: 0.6,
});

/**
 * Audio hook for vehicle sounds
 * - Engine idle: rate 0.8 (low rumble when stationary)
 * - Engine moving: rate scales 1.0-2.2 with speed
 * - Engine boosting: rate 2.5 (high rev)
 */
export function useAudio() {
    const isPlayingEngine = useRef(false);
    const wasHonking = useRef(false);

    const playerSpeed = useGameStore((state) => state.player.speed);
    const engineOn = useGameStore((state) => state.vehicle.engineOn);
    const isBoosting = useGameStore((state) => state.vehicle.isBoosting);
    const soundEnabled = useGameStore((state) => state.settings.soundEnabled);

    const keyboard = useKeyboard();

    // Play engine sound
    const playEngine = useCallback(() => {
        if (!isPlayingEngine.current && soundEnabled) {
            engineSound.play();
            isPlayingEngine.current = true;
        }
    }, [soundEnabled]);

    // Stop engine sound
    const stopEngine = useCallback(() => {
        if (isPlayingEngine.current) {
            engineSound.stop();
            isPlayingEngine.current = false;
        }
    }, []);

    // Play honk sound
    const playHonk = useCallback(() => {
        if (soundEnabled) {
            honkSound.play();
        }
    }, [soundEnabled]);

    // Handle engine on/off
    useEffect(() => {
        if (engineOn) {
            playEngine();
        } else {
            stopEngine();
        }
    }, [engineOn, playEngine, stopEngine]);

    // Update engine pitch based on state
    useEffect(() => {
        if (!isPlayingEngine.current) return;

        let rate: number;

        if (isBoosting) {
            // Boosting: high rev
            rate = 2.5;
        } else if (playerSpeed > 1) {
            // Moving: scale from 1.0 to 2.2 based on speed
            rate = 1.0 + (playerSpeed / 15);
            rate = Math.min(rate, 2.2);
        } else {
            // Idle: low rumble
            rate = 0.8;
        }

        engineSound.rate(rate);
    }, [playerSpeed, isBoosting]);

    // Handle honk (Spacebar)
    useEffect(() => {
        if (keyboard.honk && !wasHonking.current) {
            playHonk();
            wasHonking.current = true;
        } else if (!keyboard.honk) {
            wasHonking.current = false;
        }
    }, [keyboard.honk, playHonk]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            engineSound.stop();
            honkSound.stop();
        };
    }, []);

    return { playEngine, stopEngine, playHonk };
}
