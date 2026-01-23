/**
 * Leaderboard Component
 * Displays global speedrun leaderboard with score submission
 * @module components/UI/Leaderboard
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useVisitorId } from '../../hooks/useVisitorId';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { useAchievementStore } from '../../stores/achievementStore';
import { useGameStore } from '../../stores/gameStore';
import './Leaderboard.css';

/**
 * Format milliseconds as MM:SS.mmm
 */
function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

export function Leaderboard() {
    const visitorId = useVisitorId();
    const [nickname, setNickname] = useState('');
    const [submitStatus, setSubmitStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convex queries
    const topScores = useQuery(api.leaderboard.getTopScores, { limit: 10 });
    const playerScore = useQuery(api.leaderboard.getPlayerScore, { visitorId });
    const submitScore = useMutation(api.leaderboard.submitScore);

    // Progress data for eligibility check
    const collectibleProgress = useCollectibleStore((s) => s.getProgress());
    const achievementProgress = useAchievementStore((s) => s.getProgress());
    const visitedBuildings = useGameStore((s) => s.game.visitedBuildings);
    const sessionStart = useGameStore((s) => s.game.sessionStart);

    // Calculate total completion percentage
    const totalItems = collectibleProgress.total + achievementProgress.total + 5; // 5 buildings
    const completedItems = collectibleProgress.collected + achievementProgress.unlocked + visitedBuildings.length;
    const completionPercent = Math.round((completedItems / totalItems) * 100);
    const is100Percent = completionPercent >= 100;

    // NOTE: We removed the Date.now() - sessionStart calculation here
    // because it was causing infinite re-renders every frame.
    // The speedrun time is now taken from SpeedrunOverlay which uses proper timing.

    const handleSubmit = async () => {
        if (!is100Percent || nickname.length < 1 || nickname.length > 20) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const result = await submitScore({
                visitorId,
                nickname,
                speedRunTime: Date.now() - sessionStart, // Calculate once at submit time
                completionPercent,
            });

            if (result.success) {
                setSubmitStatus(`🎉 ${result.message} Rank: #${result.rank}`);
            } else {
                setSubmitStatus(`⚠️ ${result.message}`);
            }
        } catch (error: any) {
            setSubmitStatus(`❌ Error: ${error.message || 'Failed to submit'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="leaderboard">
            <h3 className="leaderboard-title">🏆 Speedrun Leaderboard</h3>

            {/* Leaderboard Table */}
            <div className="leaderboard-table">
                {topScores === undefined ? (
                    <div className="leaderboard-loading">Loading...</div>
                ) : topScores.length === 0 ? (
                    <div className="leaderboard-empty">
                        No scores yet. Be the first!
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Time</th>
                                <th>When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topScores.map((entry, index) => (
                                <tr
                                    key={entry._id}
                                    className={entry.visitorId === visitorId ? 'is-player' : ''}
                                >
                                    <td className="rank">
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                        {index > 2 && `#${index + 1}`}
                                    </td>
                                    <td className="nickname">{entry.nickname}</td>
                                    <td className="time">{formatTime(entry.speedRunTime)}</td>
                                    <td className="when">{formatRelativeTime(entry.submittedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Player's best score */}
            {playerScore && (
                <div className="player-best">
                    Your best: <strong>{formatTime(playerScore.speedRunTime)}</strong>
                </div>
            )}

            {/* Submit form */}
            <div className="leaderboard-submit">
                {!is100Percent ? (
                    <div className="submit-locked">
                        <span className="lock-icon">🔒</span>
                        <span>Complete 100% to submit (currently {completionPercent}%)</span>
                    </div>
                ) : (
                    <>
                        <div className="submit-form">
                            <input
                                type="text"
                                placeholder="Enter nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={20}
                                className="nickname-input"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || nickname.length < 1}
                                className="submit-button"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Score'}
                            </button>
                        </div>
                        <div className="current-time">
                            <em>Use Time Trial mode for speedrun times</em>
                        </div>
                    </>
                )}
                {submitStatus && (
                    <div className="submit-status">{submitStatus}</div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
