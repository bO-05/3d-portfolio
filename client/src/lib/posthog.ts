/**
 * PostHog Analytics initialization and helper functions
 * @module lib/posthog
 */

import posthog from 'posthog-js';

const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

/**
 * Initialize PostHog analytics
 * Call this once in main.tsx before rendering the app
 */
export function initPostHog(): void {
    if (!POSTHOG_API_KEY) {
        console.warn('PostHog API key not set. Analytics disabled.');
        return;
    }

    posthog.init(POSTHOG_API_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage',
    });
}

/**
 * Track a custom event
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to attach to the event
 */
export function trackEvent(
    eventName: string,
    properties?: Record<string, unknown>
): void {
    posthog.capture(eventName, properties);
}

/**
 * Track FPS performance samples
 * @param fps - Current frames per second
 * @param drawCalls - Number of draw calls
 * @param triangles - Number of triangles rendered
 */
export function trackFPS(
    fps: number,
    drawCalls: number,
    triangles: number
): void {
    posthog.capture('fps_sample', { fps, drawCalls, triangles });
}

/**
 * Track building entry
 * @param buildingId - ID of the building entered
 * @param sessionStart - Timestamp when session started
 * @param visitedBuildings - Array of previously visited building IDs
 */
export function trackBuildingEntered(
    buildingId: string,
    sessionStart: number,
    visitedBuildings: string[]
): void {
    posthog.capture('building_entered', {
        buildingId,
        timeSpent: performance.now() - sessionStart,
        buildingsVisitedSoFar: visitedBuildings.length,
    });
}

/**
 * Track asset loading completion
 * @param loadTime - Time taken to load assets in milliseconds
 * @param buildingCount - Number of buildings loaded
 */
export function trackAssetsLoaded(loadTime: number, buildingCount: number): void {
    posthog.capture('assets_loaded', { loadTime, buildingCount });
}

/**
 * Track when vehicle first moves
 */
export function trackVehicleMoved(): void {
    posthog.capture('vehicle_moved');
}

/**
 * Track AI chat interactions
 * @param building - Building where chat occurred
 * @param promptLength - Length of the user's prompt
 * @param responseTime - Time taken for AI to respond in ms
 */
export function trackAIChat(
    building: string,
    promptLength: number,
    responseTime: number
): void {
    posthog.capture('ai_chat_message', {
        building,
        promptLength,
        responseTime,
    });
}

/**
 * Track mobile session start
 */
export function trackMobileSession(): void {
    posthog.capture('mobile_session_started');
}

/**
 * Track performance degradation
 * @param deviceInfo - Information about the device
 */
export function trackPerformanceDegraded(deviceInfo: {
    userAgent: string;
    avgFPS: number;
    qualityLevel: string;
}): void {
    posthog.capture('performance_degraded', deviceInfo);
}

export { posthog };
