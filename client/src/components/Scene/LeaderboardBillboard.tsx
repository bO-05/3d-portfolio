/**
 * LeaderboardBillboard - Solid 3D signpost showing top speedrun scores
 * 
 * Design:
 * - Wooden pole supporting a thick solid board
 * - Board faces the spawn point (negative Z direction)
 * - STATIC physics collision (invisible) so vehicle cannot pass through
 * - Top 5 leaderboard entries - REAL-TIME updates via Convex subscription
 * - Uses Html from drei for crisp text
 * 
 * @module components/Scene/LeaderboardBillboard
 */

import { memo } from 'react';
import { Html } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { useQuery } from 'convex/react';
import type { Mesh } from 'three';
import { api } from '../../../convex/_generated/api';

// Position moved to LEFT side near trees, facing toward center
const SIGNPOST_POSITION: [number, number, number] = [-15, 0, 28];

// Board dimensions
const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 3.5;
const BOARD_DEPTH = 0.3;

/**
 * Format milliseconds as M:SS.mm
 */
function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
}

/**
 * Solid 3D signpost with leaderboard and physics collision
 * Convex useQuery provides LIVE subscription - updates automatically when data changes
 */
export const LeaderboardBillboard = memo(function LeaderboardBillboard() {
    // Convex useQuery is a LIVE subscription - automatically updates when leaderboard changes!
    const topScores = useQuery(api.leaderboard.getTopScores, { limit: 5 });

    // INVISIBLE physics collision for board - Static so can't be knocked
    useBox<Mesh>(() => ({
        type: 'Static',
        position: [SIGNPOST_POSITION[0], 3.5, SIGNPOST_POSITION[2]],
        args: [BOARD_WIDTH + 0.5, BOARD_HEIGHT + 0.5, BOARD_DEPTH + 0.5],
    }));

    // INVISIBLE physics collision for pole
    useBox<Mesh>(() => ({
        type: 'Static',
        position: [SIGNPOST_POSITION[0], 1.5, SIGNPOST_POSITION[2]],
        args: [0.5, 3, 0.5],
    }));

    return (
        <group position={SIGNPOST_POSITION}>
            {/* Wooden pole - positioned BEHIND the board so not visible from front */}
            <mesh position={[0, 1.75, 0.3]}>
                <cylinderGeometry args={[0.15, 0.2, 3.5, 8]} />
                <meshBasicMaterial color="#4a3728" />
            </mesh>

            {/* Pole base - behind the board */}
            <mesh position={[0, 0.1, 0.3]}>
                <cylinderGeometry args={[0.35, 0.45, 0.2, 8]} />
                <meshBasicMaterial color="#3a2718" />
            </mesh>

            {/* Sign board group - facing toward spawn */}
            <group position={[0, 3.5, 0]} rotation={[0, Math.PI, 0]}>
                {/* Board backing - solid panel */}
                <mesh>
                    <boxGeometry args={[BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH]} />
                    <meshBasicMaterial color="#1a1a2e" />
                </mesh>

                {/* Board frame - top */}
                <mesh position={[0, BOARD_HEIGHT / 2, 0]}>
                    <boxGeometry args={[BOARD_WIDTH + 0.15, 0.12, BOARD_DEPTH + 0.05]} />
                    <meshBasicMaterial color="#00aaff" />
                </mesh>

                {/* Board frame - bottom */}
                <mesh position={[0, -BOARD_HEIGHT / 2, 0]}>
                    <boxGeometry args={[BOARD_WIDTH + 0.15, 0.12, BOARD_DEPTH + 0.05]} />
                    <meshBasicMaterial color="#00aaff" />
                </mesh>

                {/* Board frame - left */}
                <mesh position={[-BOARD_WIDTH / 2, 0, 0]}>
                    <boxGeometry args={[0.12, BOARD_HEIGHT, BOARD_DEPTH + 0.05]} />
                    <meshBasicMaterial color="#00aaff" />
                </mesh>

                {/* Board frame - right */}
                <mesh position={[BOARD_WIDTH / 2, 0, 0]}>
                    <boxGeometry args={[0.12, BOARD_HEIGHT, BOARD_DEPTH + 0.05]} />
                    <meshBasicMaterial color="#00aaff" />
                </mesh>

                {/* HTML content - LARGER scale for bigger text */}
                <Html
                    position={[0, 0, BOARD_DEPTH / 2 + 0.01]}
                    transform
                    scale={0.35}
                    style={{
                        width: '600px',
                        background: 'transparent',
                        padding: '0',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    <div style={{
                        fontFamily: 'monospace',
                        color: 'white',
                        textAlign: 'center',
                        width: '100%',
                    }}>
                        <div style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: '#00aaff',
                            marginBottom: '12px',
                            textShadow: '0 0 10px #00aaff',
                        }}>
                            🏆 TIME TRIAL
                        </div>

                        {topScores === undefined ? (
                            <div style={{ color: '#888', fontSize: '24px' }}>
                                Loading...
                            </div>
                        ) : topScores.length === 0 ? (
                            <div style={{ color: '#888', fontSize: '24px' }}>
                                No scores yet! Be the first!
                            </div>
                        ) : (
                            <div style={{ fontSize: '22px', lineHeight: '2' }}>
                                {topScores.map((entry, i) => {
                                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                                    return (
                                        <div
                                            key={entry._id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '4px 50px',
                                                borderBottom: i < topScores.length - 1 ? '2px solid #444' : 'none',
                                            }}
                                        >
                                            <span>{medal} {entry.nickname}</span>
                                            <span style={{ color: '#00ff88' }}>
                                                {formatTime(entry.speedRunTime)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{
                            marginTop: '16px',
                            fontSize: '16px',
                            color: '#888',
                        }}>
                            Drive to blue ring to compete!
                        </div>
                    </div>
                </Html>
            </group>
        </group>
    );
});

export default LeaderboardBillboard;
