/**
 * Sentry Error Tracking initialization
 * @module lib/sentry
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialize Sentry error tracking
 * Call this once in main.tsx before rendering the app
 */
export function initSentry(): void {
    if (!SENTRY_DSN) {
        console.warn('Sentry DSN not set. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of transactions in development
        // Session Replay
        replaysSessionSampleRate: 0.1, // Sample 10% of sessions
        replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
        environment: import.meta.env.MODE,
    });
}

/**
 * Capture an exception with additional context
 * @param error - The error to capture
 * @param context - Additional context about the error
 */
export function captureError(
    error: Error,
    context?: {
        feature?: string;
        prompt?: string;
        response?: string;
        buildingId?: string;
        [key: string]: unknown;
    }
): void {
    Sentry.captureException(error, {
        tags: context?.feature ? { feature: context.feature } : undefined,
        contexts: context ? { additional: context } : undefined,
    });
}

/**
 * Set user context for error tracking
 * @param userId - Optional user ID
 */
export function setUserContext(userId?: string): void {
    Sentry.setUser(userId ? { id: userId } : null);
}

/**
 * React Error Boundary component for catching render errors
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

export { Sentry };
