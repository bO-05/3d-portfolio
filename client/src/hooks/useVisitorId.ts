/**
 * Visitor ID Hook
 * Generates and persists an anonymous visitor identity
 * Used for cross-device sync without requiring authentication
 * @module hooks/useVisitorId
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'jakarta-visitor-id';

/**
 * Generate a UUID v4 (RFC 4122 compliant)
 * Falls back to Math.random if crypto.randomUUID unavailable
 */
function generateVisitorId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Get or create visitor ID from localStorage
 * Synchronous for initial render (avoids flash of undefined)
 */
function getOrCreateVisitorId(): string {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored.length > 0) {
            return stored;
        }
        const newId = generateVisitorId();
        localStorage.setItem(STORAGE_KEY, newId);
        return newId;
    } catch (e) {
        // localStorage unavailable (private browsing, etc.)
        console.warn('[useVisitorId] localStorage unavailable:', e);
        // Return a session-only ID (won't persist across tabs)
        return generateVisitorId();
    }
}

/**
 * Hook to get the persistent anonymous visitor ID
 * @returns {string} The visitor ID (never undefined)
 */
export function useVisitorId(): string {
    // Initialize synchronously to avoid hydration mismatch
    const [visitorId] = useState<string>(() => getOrCreateVisitorId());

    // Verify persistence on mount (defensive)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored !== visitorId) {
                localStorage.setItem(STORAGE_KEY, visitorId);
            }
        } catch (e) {
            // Silently ignore storage errors
        }
    }, [visitorId]);

    return visitorId;
}

export default useVisitorId;
