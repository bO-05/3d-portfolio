/**
 * Device detection utilities for WebGL robustness
 * Detects device capabilities and returns quality recommendations
 * Results are memoized to avoid repeated WebGL context probing
 * @module utils/deviceDetection
 */

export type QualityTier = 'low' | 'medium' | 'high';

interface DeviceInfo {
    deviceMemory: number;
    hardwareConcurrency: number;
    isMobile: boolean;
    isTouch: boolean;
    gpuRenderer: string | null;
    gpuVendor: string | null;
}

interface CachedDeviceData {
    info: DeviceInfo;
    tier: QualityTier;
    score: number;
}

const LOW_END_GPU_KEYWORDS = [
    'intel',
    'intel hd',
    'intel uhd',
    'intel iris',
    'mali',
    'adreno',
    'powervr',
    'apple gpu',
    'swiftshader',
    'llvmpipe',
    'mesa',
];

const HIGH_END_GPU_KEYWORDS = [
    'nvidia',
    'geforce',
    'rtx',
    'gtx',
    'radeon rx',
    'radeon pro',
    'quadro',
];

// ─────────────────────────────────────────────────────────────
// Memoization cache - computed once per session
// ─────────────────────────────────────────────────────────────

let cachedData: CachedDeviceData | null = null;

function getWebGLInfo(): { renderer: string | null; vendor: string | null } {
    if (typeof document === 'undefined') {
        return { renderer: null, vendor: null };
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return { renderer: null, vendor: null };

        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return { renderer: null, vendor: null };

        return {
            renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        };
    } catch {
        return { renderer: null, vendor: null };
    }
}

function isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    const hasTouch = 'ontouchstart' in window;
    const hasMaxTouchPoints =
        typeof navigator !== 'undefined' && navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0;

    return hasTouch || hasMaxTouchPoints;
}

function getDeviceMemory(): number {
    if (typeof navigator === 'undefined') return 4;
    return (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
}

function getHardwareConcurrency(): number {
    if (typeof navigator === 'undefined') return 4;
    return navigator.hardwareConcurrency ?? 4;
}

function scoreGPU(renderer: string | null): number {
    if (!renderer) return 50;

    const lowerRenderer = renderer.toLowerCase();

    for (const keyword of HIGH_END_GPU_KEYWORDS) {
        if (lowerRenderer.includes(keyword)) {
            return 100;
        }
    }

    for (const keyword of LOW_END_GPU_KEYWORDS) {
        if (lowerRenderer.includes(keyword)) {
            return 30;
        }
    }

    return 50;
}

function computeDeviceInfo(): DeviceInfo {
    const webglInfo = getWebGLInfo();

    return {
        deviceMemory: getDeviceMemory(),
        hardwareConcurrency: getHardwareConcurrency(),
        isMobile: isMobileDevice(),
        isTouch: isTouchDevice(),
        gpuRenderer: webglInfo.renderer,
        gpuVendor: webglInfo.vendor,
    };
}

function computeDeviceScore(info: DeviceInfo): number {
    let score = 0;

    // Memory scoring (0-25 points)
    if (info.deviceMemory >= 8) score += 25;
    else if (info.deviceMemory >= 4) score += 15;
    else score += 5;

    // CPU cores scoring (0-25 points)
    if (info.hardwareConcurrency >= 8) score += 25;
    else if (info.hardwareConcurrency >= 4) score += 15;
    else score += 5;

    // GPU scoring (0-30 points)
    const gpuScore = scoreGPU(info.gpuRenderer);
    score += Math.round(gpuScore * 0.3);

    // Mobile penalty (0-20 points deduction)
    if (info.isMobile) score -= 20;

    // Normalize score to 0-100
    return Math.max(0, Math.min(100, score));
}

function computeTierFromScore(score: number): QualityTier {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

/**
 * Initializes and caches device detection data
 * Called once, results are memoized for the session
 */
function ensureCachedData(): CachedDeviceData {
    if (cachedData === null) {
        const info = computeDeviceInfo();
        const score = computeDeviceScore(info);
        const tier = computeTierFromScore(score);

        cachedData = { info, tier, score };

        // Log detection results once in development
        if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.log('[DeviceDetection] Cached:', cachedData);
        }
    }
    return cachedData;
}

// ─────────────────────────────────────────────────────────────
// Public API - all use memoized data
// ─────────────────────────────────────────────────────────────

export function getDeviceInfo(): DeviceInfo {
    return ensureCachedData().info;
}

export function detectDeviceTier(): QualityTier {
    return ensureCachedData().tier;
}

export function getRecommendedDPR(): number {
    const tier = ensureCachedData().tier;
    const nativeDPR = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    switch (tier) {
        case 'high':
            return Math.min(nativeDPR, 2);
        case 'medium':
            return Math.min(nativeDPR, 1.5);
        case 'low':
            return 1;
    }
}

export function shouldEnableShadows(): boolean {
    return ensureCachedData().tier !== 'low';
}

export function shouldEnableEffects(): boolean {
    return ensureCachedData().tier === 'high';
}

export function shouldEnableAntialias(): boolean {
    return ensureCachedData().tier !== 'low';
}

/**
 * Clears the cached device data (useful for testing)
 */
export function clearDeviceCache(): void {
    cachedData = null;
}
