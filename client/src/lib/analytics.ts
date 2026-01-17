/**
 * Lazy PostHog Analytics wrapper
 * 
 * This module provides a lazy-loading wrapper for PostHog analytics.
 * It ensures analytics are not in the critical render path while still
 * allowing components to call tracking functions synchronously.
 * 
 * Tracking calls are queued and executed once PostHog is loaded.
 * 
 * @module lib/analytics
 */

// Queue for events captured before PostHog is loaded
type QueuedEvent = {
    type: 'event' | 'fps' | 'building' | 'assets' | 'vehicle' | 'ai_chat' | 'mobile' | 'performance';
    args: unknown[];
};

const eventQueue: QueuedEvent[] = [];
let isInitialized = false;

// Lazy load the posthog module
let posthogModulePromise: Promise<typeof import('./posthog')> | null = null;

function getPosthogModule() {
    if (!posthogModulePromise) {
        posthogModulePromise = import('./posthog');
    }
    return posthogModulePromise;
}

/**
 * Process queued events once PostHog is loaded
 */
async function processQueue(): Promise<void> {
    if (isInitialized) return;

    const module = await getPosthogModule();
    isInitialized = true;

    // Process all queued events
    for (const event of eventQueue) {
        switch (event.type) {
            case 'event':
                module.trackEvent(event.args[0] as string, event.args[1] as Record<string, unknown>);
                break;
            case 'fps':
                module.trackFPS(event.args[0] as number, event.args[1] as number, event.args[2] as number);
                break;
            case 'building':
                module.trackBuildingEntered(event.args[0] as string, event.args[1] as number, event.args[2] as string[]);
                break;
            case 'assets':
                module.trackAssetsLoaded(event.args[0] as number, event.args[1] as number);
                break;
            case 'vehicle':
                module.trackVehicleMoved();
                break;
            case 'ai_chat':
                module.trackAIChat(event.args[0] as string, event.args[1] as number, event.args[2] as number);
                break;
            case 'mobile':
                module.trackMobileSession();
                break;
            case 'performance':
                module.trackPerformanceDegraded(event.args[0] as { userAgent: string; avgFPS: number; qualityLevel: string });
                break;
        }
    }
    eventQueue.length = 0; // Clear queue
}

/**
 * Track a custom event (lazy)
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackEvent(eventName, properties));
    } else {
        eventQueue.push({ type: 'event', args: [eventName, properties] });
    }
}

/**
 * Track FPS performance (lazy)
 */
export function trackFPS(fps: number, drawCalls: number, triangles: number): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackFPS(fps, drawCalls, triangles));
    } else {
        eventQueue.push({ type: 'fps', args: [fps, drawCalls, triangles] });
    }
}

/**
 * Track building entry (lazy)
 */
export function trackBuildingEntered(buildingId: string, sessionStart: number, visitedBuildings: string[]): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackBuildingEntered(buildingId, sessionStart, visitedBuildings));
    } else {
        eventQueue.push({ type: 'building', args: [buildingId, sessionStart, visitedBuildings] });
    }
}

/**
 * Track assets loaded (lazy)
 */
export function trackAssetsLoaded(loadTime: number, buildingCount: number): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackAssetsLoaded(loadTime, buildingCount));
    } else {
        eventQueue.push({ type: 'assets', args: [loadTime, buildingCount] });
    }
}

/**
 * Track vehicle moved (lazy)
 */
export function trackVehicleMoved(): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackVehicleMoved());
    } else {
        eventQueue.push({ type: 'vehicle', args: [] });
    }
}

/**
 * Track AI chat (lazy)
 */
export function trackAIChat(building: string, promptLength: number, responseTime: number): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackAIChat(building, promptLength, responseTime));
    } else {
        eventQueue.push({ type: 'ai_chat', args: [building, promptLength, responseTime] });
    }
}

/**
 * Track mobile session (lazy)
 */
export function trackMobileSession(): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackMobileSession());
    } else {
        eventQueue.push({ type: 'mobile', args: [] });
    }
}

/**
 * Track performance degradation (lazy)
 */
export function trackPerformanceDegraded(deviceInfo: {
    userAgent: string;
    avgFPS: number;
    qualityLevel: string;
}): void {
    if (isInitialized) {
        getPosthogModule().then(m => m.trackPerformanceDegraded(deviceInfo));
    } else {
        eventQueue.push({ type: 'performance', args: [deviceInfo] });
    }
}

/**
 * Initialize analytics (call this after page is interactive)
 */
export async function initAnalytics(): Promise<void> {
    const module = await getPosthogModule();
    module.initPostHog();
    await processQueue();
}
