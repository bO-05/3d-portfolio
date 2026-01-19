/**
 * Web Audio Synthesis - Procedural sound effects
 * Zero file downloads, works everywhere with user interaction
 * @module lib/synthSounds
 */

let audioContext: AudioContext | null = null;

/**
 * Get or create AudioContext (resumed on first user interaction)
 */
export function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Resume audio context (call on first user interaction)
 */
export async function resumeAudioContext(): Promise<void> {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
}

/**
 * Play collect "ding" sound - ascending chime
 * 800Hz → 1200Hz over 200ms with attack/decay envelope
 * @param volume - Volume multiplier (0-1), defaults to 1
 */
export function playCollectSound(volume: number = 1): void {
    if (volume <= 0) return; // Guard against exponentialRamp to zero
    const ctx = getAudioContext();
    if (ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);

    // Attack/decay envelope to prevent clicks (scaled by volume)
    const peakGain = 0.25 * volume;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
}

/**
 * Play achievement fanfare - triumphant chord progression
 * C5 → E5 → G5 with staggered starts, total ~500ms
 * @param volume - Volume multiplier (0-1), defaults to 1
 */
export function playAchievementSound(volume: number = 1): void {
    if (volume <= 0) return; // Guard against exponentialRamp to zero
    const ctx = getAudioContext();
    if (ctx.state !== 'running') return;

    // Chord frequencies (C5, E5, G5)
    const frequencies = [523.25, 659.25, 783.99];
    const delays = [0, 0.08, 0.16];

    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = delays[i]!; // Safe: forEach guarantees valid index
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        // Slight pitch rise for excitement
        osc.frequency.linearRampToValueAtTime(freq * 1.02, ctx.currentTime + delay + 0.3);

        // Staggered envelope (scaled by volume)
        const peakGain = 0.15 * volume;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.4);

        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.4);
    });
}
