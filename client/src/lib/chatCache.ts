/**
 * Chat Response Cache
 * Stores FAQ responses in localStorage to reduce API calls
 * @module lib/chatCache
 */

const CACHE_KEY = 'warung-chat-cache';
const TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ENTRIES = 50;

interface CacheEntry {
    response: string;
    timestamp: number;
}

interface CacheStore {
    [key: string]: CacheEntry;
}

/**
 * Simple hash function for cache keys
 * Normalizes prompt to reduce duplicates
 */
function hashPrompt(prompt: string): string {
    const normalized = prompt.toLowerCase().trim().slice(0, 100);
    // Simple base64 encoding is sufficient for cache keys
    return btoa(unescape(encodeURIComponent(normalized)));
}

/**
 * Get cached response if valid
 */
export function getCachedResponse(prompt: string): string | null {
    try {
        const cache: CacheStore = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const key = hashPrompt(prompt);
        const entry = cache[key];

        if (entry && Date.now() - entry.timestamp < TTL) {
            return entry.response;
        }
        return null;
    } catch {
        // localStorage not available or corrupted
        return null;
    }
}

/**
 * Store response in cache
 */
export function setCachedResponse(prompt: string, response: string): void {
    try {
        const cache: CacheStore = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const key = hashPrompt(prompt);

        cache[key] = {
            response,
            timestamp: Date.now(),
        };

        // Limit cache size - remove oldest entries
        const keys = Object.keys(cache);
        if (keys.length > MAX_ENTRIES) {
            // Sort by timestamp and remove oldest
            const sorted = keys.sort((a, b) => (cache[a]?.timestamp ?? 0) - (cache[b]?.timestamp ?? 0));
            sorted.slice(0, keys.length - MAX_ENTRIES).forEach((k) => delete cache[k]);
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // localStorage not available - fail silently
    }
}

/**
 * Clear all cached responses
 */
export function clearCache(): void {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch {
        // Fail silently
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { entries: number; size: string } {
    try {
        const cache: CacheStore = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const entries = Object.keys(cache).length;
        const size = new Blob([localStorage.getItem(CACHE_KEY) || '']).size;
        return {
            entries,
            size: `${(size / 1024).toFixed(2)} KB`,
        };
    } catch {
        return { entries: 0, size: '0 KB' };
    }
}
