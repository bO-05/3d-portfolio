/**
 * Robust Draco Loader with self-hosted decoder
 * Handles initialization failures gracefully
 * @module lib/dracoLoader
 */

import { DRACOLoader } from 'three-stdlib';

let dracoLoader: DRACOLoader | null = null;
let isInitialized = false;
let initError: Error | null = null;

/**
 * Initialize the Draco loader with self-hosted decoder path
 * Call this early in app startup
 */
export function initDracoLoader(): DRACOLoader {
  if (dracoLoader) return dracoLoader;

  dracoLoader = new DRACOLoader();
  // Self-hosted path - no CDN dependency
  dracoLoader.setDecoderPath('/draco/');

  // Preload decoder
  try {
    dracoLoader.preload();
    isInitialized = true;
  } catch (error) {
    initError = error instanceof Error ? error : new Error('Draco init failed');
    console.warn('[DracoLoader] Initialization failed:', initError);
  }

  return dracoLoader;
}

/**
 * Get the singleton Draco loader instance
 */
export function getDracoLoader(): DRACOLoader | null {
  if (!dracoLoader) {
    initDracoLoader();
  }
  return dracoLoader;
}

/**
 * Check if Draco loader is available
 */
export function isDracoAvailable(): boolean {
  return isInitialized && !initError;
}

/**
 * Dispose of Draco loader resources
 */
export function disposeDracoLoader(): void {
  if (dracoLoader) {
    dracoLoader.dispose();
    dracoLoader = null;
    isInitialized = false;
    initError = null;
  }
}
