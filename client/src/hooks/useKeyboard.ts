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

/**
 * Check if any text input is currently focused
 * Prevents game hotkeys from firing while typing
 */
function isInputFocused(): boolean {
     const activeElement = document.activeElement;
     if (!activeElement) return false;
     
     // Block hotkeys if typing in input, textarea, or contentEditable
     return (
         activeElement instanceof HTMLInputElement ||
         activeElement instanceof HTMLTextAreaElement ||
         (activeElement instanceof HTMLElement && activeElement.isContentEditable)
     );
}

function initKeyboardListeners() {
     if (listenersInitialized) return;
     listenersInitialized = true;

     const handleKeyDown = (e: KeyboardEvent) => {
         // Don't process game hotkeys if typing in input
         const inputFocused = isInputFocused();

         // Movement keys - blocked if input focused
         if (!inputFocused) {
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
                     e.preventDefault(); // Prevent space scrolling page
                     keyboardState.honk = true;
                     break;
             }
         }

         // Toggle keys (fire once on keydown) - also blocked if input focused
         if (!inputFocused) {
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
         }
     };

     const handleKeyUp = (e: KeyboardEvent) => {
         // ALWAYS process key releases regardless of input focus
         // This prevents stuck keys when focus changes between keydown/keyup
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

     /**
      * Reset all movement flags when input gains focus
      * This prevents stuck keys if user presses key before focusing input
      */
     const handleFocusIn = () => {
         keyboardState.forward = false;
         keyboardState.backward = false;
         keyboardState.left = false;
         keyboardState.right = false;
         keyboardState.boost = false;
         keyboardState.honk = false;
     };

     /**
      * Reset all movement flags when window loses focus or becomes invisible
      * Prevents stuck keys when user switches tabs or minimizes window
      */
     const resetKeyboardState = () => {
         keyboardState.forward = false;
         keyboardState.backward = false;
         keyboardState.left = false;
         keyboardState.right = false;
         keyboardState.boost = false;
         keyboardState.honk = false;
     };

     /**
      * Reset keys only when page becomes hidden (not when it becomes visible again)
      * Prevents clearing keys that user is still holding when tab regains focus
      */
     const handleVisibilityChange = () => {
         if (document.hidden) {
             resetKeyboardState();
         }
     };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', resetKeyboardState);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Note: All listeners are intentionally persistent as this hook uses a global singleton pattern
    // via listenersInitialized flag. Keyboard state must persist for the entire app lifecycle.
    // Multiple reset handlers ensure keys are cleared on:
    // - Tab/window loses focus (window.blur)
    // - Page becomes hidden (document.visibilitychange, document.hidden check)
    // - Input/textarea gains focus (document.focusin)
    // - Key release (window.keyup)
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
