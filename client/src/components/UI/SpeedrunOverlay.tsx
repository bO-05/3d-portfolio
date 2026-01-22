/**
 * SpeedrunOverlay - UI overlay for speedrun mode
 * Shows initials input, countdown, live timer, and completion screen
 * @module components/UI/SpeedrunOverlay
 */

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useSpeedrunStore, formatSpeedrunTime } from '../../stores/speedrunStore';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useVisitorId } from '../../hooks/useVisitorId';
import { SPEEDRUN_RING_COUNT } from '../Scene/SpeedrunRings';
import './SpeedrunOverlay.css';

const TOTAL_COLLECTIBLES = SPEEDRUN_RING_COUNT; // 10 speedrun-only rings

export const SpeedrunOverlay = memo(function SpeedrunOverlay() {
    const visitorId = useVisitorId();
    const phase = useSpeedrunStore((state) => state.phase);
    const playerInitials = useSpeedrunStore((state) => state.playerInitials);
    const countdown = useSpeedrunStore((state) => state.countdown);
    const finalTime = useSpeedrunStore((state) => state.finalTime);
    const rank = useSpeedrunStore((state) => state.rank);
    const getElapsedTime = useSpeedrunStore((state) => state.getElapsedTime);
    const setInitials = useSpeedrunStore((state) => state.setInitials);
    const startCountdown = useSpeedrunStore((state) => state.startCountdown);
    const tickCountdown = useSpeedrunStore((state) => state.tickCountdown);
    const startRun = useSpeedrunStore((state) => state.startRun);
    const completeRun = useSpeedrunStore((state) => state.completeRun);
    const markSubmitted = useSpeedrunStore((state) => state.markSubmitted);
    const resetSpeedrun = useSpeedrunStore((state) => state.reset);

    // Get permanent collectibles (for saving before speedrun)
    const permanentCollected = useCollectibleStore((state) => state.collected);

    // Use speedrun-specific collectible count (isolated from permanent progress)
    const speedrunCollected = useSpeedrunStore((state) => state.speedrunCollected);
    const speedrunCollectedCount = speedrunCollected.size;

    // Convex mutation
    const submitScore = useMutation(api.leaderboard.submitScore);

    // Live timer display
    const [displayTime, setDisplayTime] = useState('00:00.000');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const permanentCollectedRef = useRef(permanentCollected);
    const hasSubmittedRef = useRef(false);

    // Note: ENTER key for entering initials is handled in SpeedrunZone.tsx

    // Focus input when entering initials
    useEffect(() => {
        if (phase === 'entering_initials' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [phase]);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'countdown') return;

        const timer = setInterval(() => {
            tickCountdown();
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, tickCountdown]);

    // Keep permanentCollectedRef updated
    useEffect(() => {
        permanentCollectedRef.current = permanentCollected;
    }, [permanentCollected]);

    // Transition from countdown to running when countdown reaches 0
    useEffect(() => {
        if (phase === 'countdown' && countdown === 0) {
            // Save permanent collectibles then start run with fresh speedrun tracking
            // NOTE: We do NOT call resetCollectibles() - permanent progress is preserved
            // Use ref to avoid stale closure in setTimeout
            setTimeout(() => {
                const permanentArray = Array.from(permanentCollectedRef.current);
                startRun(permanentArray);
            }, 500); // Brief "GO!" display
        }
    }, [phase, countdown, startRun]);

    // Live timer update
    useEffect(() => {
        if (phase !== 'running') return;

        const timer = setInterval(() => {
            setDisplayTime(formatSpeedrunTime(getElapsedTime()));
        }, 16); // ~60fps

        return () => clearInterval(timer);
    }, [phase, getElapsedTime]);

    // Auto-complete when all speedrun collectibles collected
    useEffect(() => {
        if (phase === 'running' && speedrunCollectedCount >= TOTAL_COLLECTIBLES) {
            completeRun();
        }
    }, [phase, speedrunCollectedCount, completeRun]);

    // Auto-submit score on completion (use ref to prevent re-execution)
    useEffect(() => {
        if (phase !== 'completed' || !finalTime || hasSubmittedRef.current) return;

        hasSubmittedRef.current = true;
        const submit = async () => {
            setSubmitting(true);
            setSubmitError(null);

            try {
                const result = await submitScore({
                    visitorId,
                    nickname: playerInitials || 'AAA',
                    speedRunTime: finalTime,
                    completionPercent: 100,
                });

                if (result.success && result.rank) {
                    markSubmitted(result.rank);
                } else {
                    setSubmitError(result.message);
                    markSubmitted(0);
                }
            } catch (err) {
                console.error('[Speedrun] Submit failed:', err);
                setSubmitError('Failed to submit score');
                markSubmitted(0);
            } finally {
                setSubmitting(false);
            }
        };

        submit();
    }, [phase, finalTime, visitorId, playerInitials, submitScore, markSubmitted]);

    // Reset hasSubmittedRef when phase changes away from completed
    useEffect(() => {
        if (phase !== 'completed' && phase !== 'submitted') {
            hasSubmittedRef.current = false;
        }
    }, [phase]);

    // Handle initials form submit
    const handleInitialsSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (playerInitials.length >= 1) {
            startCountdown();
        }
    }, [playerInitials, startCountdown]);

    // Render nothing if idle or ready (zone handles "Press ENTER")
    if (phase === 'idle' || phase === 'ready') {
        return null;
    }

    return (
        <>
            {/* Initials Input Modal */}
            {phase === 'entering_initials' && (
                <div className="speedrun-overlay speedrun-modal">
                    <div className="speedrun-modal-content">
                        <h2>⏱️ TIME TRIAL</h2>
                        <p>Collect all {TOTAL_COLLECTIBLES} rings as fast as you can!</p>
                        <form onSubmit={handleInitialsSubmit}>
                            <label>Enter your initials:</label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={playerInitials}
                                onChange={(e) => setInitials(e.target.value)}
                                onKeyDown={(e) => {
                                    // Stop propagation to prevent game hotkeys (J for journal, etc)
                                    e.stopPropagation();
                                }}
                                maxLength={3}
                                placeholder="AAA"
                                className="speedrun-initials-input"
                            />
                            <button
                                type="submit"
                                disabled={playerInitials.length < 1}
                                className="speedrun-start-btn"
                            >
                                START
                            </button>
                        </form>
                        <button
                            className="speedrun-cancel-btn"
                            onClick={resetSpeedrun}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Countdown */}
            {phase === 'countdown' && (
                <div className="speedrun-overlay speedrun-countdown">
                    <div className="countdown-number">
                        {countdown > 0 ? countdown : 'GO!'}
                    </div>
                </div>
            )}

            {/* Live Timer */}
            {phase === 'running' && (
                <div className="speedrun-timer-display">
                    <div className="timer-label">⏱️ TIME TRIAL</div>
                    <div className="timer-value">{displayTime}</div>
                    <div className="timer-progress">
                        {speedrunCollectedCount} / {TOTAL_COLLECTIBLES}
                    </div>
                </div>
            )}

            {/* Completion Screen */}
            {(phase === 'completed' || phase === 'submitted') && (
                <div className="speedrun-overlay speedrun-complete">
                    <div className="speedrun-complete-content">
                        <h2>🏆 TIME TRIAL COMPLETE!</h2>
                        <div className="final-time">
                            {formatSpeedrunTime(finalTime || 0)}
                        </div>
                        {submitting && <p className="submitting">Submitting score...</p>}
                        {submitError && <p className="error">{submitError}</p>}
                        {/* Only show rank if it's a valid positive number, not 0 from error */}
                        {phase === 'submitted' && rank !== null && rank > 0 && (
                            <div className="rank-display">
                                #{rank} on leaderboard!
                            </div>
                        )}
                        <button
                            className="speedrun-done-btn"
                            onClick={resetSpeedrun}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </>
    );
});

export default SpeedrunOverlay;
