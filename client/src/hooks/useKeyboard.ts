/**
 * Keyboard input hook for vehicle controls
 * Tracks all movement and action keys for real-time physics
 * @module hooks/useKeyboard
 */

import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';

interface KeyboardState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    boost: boolean;
    honk: boolean;
}

// Global keyboard state - shared across all uses
const keyboardState: KeyboardState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    honk: false,
};

let listenersInitialized = false;

function initKeyboardListeners() {
    if (listenersInitialized) return;
    listenersInitialized = true;

    const handleKeyDown = (e: KeyboardEvent) => {
        // Movement keys
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                keyboardState.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                keyboardState.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                keyboardState.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                keyboardState.right = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                keyboardState.boost = true;
                break;
            case 'Space':
                keyboardState.honk = true;
                break;
        }

        // Toggle keys (fire once on keydown)
        if (e.code === 'KeyE' && !e.repeat) {
            useGameStore.getState().toggleEngine();
        }
        if (e.code === 'KeyC' && !e.repeat) {
            useGameStore.getState().toggleHeadlights();
        }
        if (e.code === 'KeyJ' && !e.repeat) {
            useGameStore.getState().toggleJournal();
        }
        if (e.code === 'Escape' && !e.repeat) {
            useGameStore.getState().closeJournal();
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                keyboardState.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                keyboardState.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                keyboardState.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                keyboardState.right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                keyboardState.boost = false;
                break;
            case 'Space':
                keyboardState.honk = false;
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/**
 * Hook that tracks keyboard input for vehicle movement
 * Uses a global mutable object for real-time access in animation frames
 */
export function useKeyboard(): KeyboardState {
    useEffect(() => {
        initKeyboardListeners();
    }, []);

    return keyboardState;
}
