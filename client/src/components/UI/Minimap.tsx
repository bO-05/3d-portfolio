/**
 * Minimap.tsx - Real-time GTA/RPG-style minimap v3
 * 
 * FIXES in v3:
 * 1. Buildings now show as EMOJIS (always visible with color)
 * 2. Player shown as emoji 🛺 (Bajaj auto-rickshaw)
 * 3. Reset zone added to minimap
 * 4. COMPASS FIX: "N" indicator now rotates correctly with player heading
 * 5. Verified physics: rotationY=0 means facing -Z (north in Three.js)
 * 
 * @module components/UI/Minimap
 */

import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCollectibleStore } from '../../stores/collectibleStore';
import { COLLECTIBLES } from '../../data/collectibles';
import './Minimap.css';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const WORLD_SIZE = 100;

// Canvas sizes
const CANVAS_SIZE_COLLAPSED = 140;
const CANVAS_SIZE_EXPANDED = 240;
const CANVAS_SIZE_MOBILE_COLLAPSED = 110;
const CANVAS_SIZE_MOBILE_EXPANDED = 180;

// Frame rate limiting (30fps)
const FRAME_INTERVAL = 33;

// Building data - EXACT positions from Buildings.tsx
// In Three.js: -Z is north, +Z is south, +X is east, -X is west
const BUILDINGS_CONFIG: Array<{
    id: string;
    position: [number, number]; // [worldX, worldZ]
    emoji: string;
    color: string;
}> = [
        { id: 'house', position: [-25, -25], emoji: '🏠', color: '#4CAF50' },
        { id: 'internet-cafe', position: [25, -25], emoji: '💻', color: '#2196F3' },
        { id: 'library', position: [-25, 25], emoji: '📚', color: '#9C27B0' },
        { id: 'music-studio', position: [25, 25], emoji: '🎵', color: '#FF5722' },
        { id: 'warung', position: [0, -35], emoji: '🍜', color: '#FF9800' },
    ];

// Reset zone from Ground.tsx
const RESET_ZONE = { position: [0, 8] as [number, number], emoji: '🔄' };

// Collectible colors
const COLLECTIBLE_COLORS: Record<string, string> = {
    kopi: '#CD853F',
    target: '#FF6666',
    star: '#FFD700',
    note: '#FFFFCC',
    orb: '#BA55D3',
};

// Player emoji
const PLAYER_EMOJI = '🛺'; // Auto-rickshaw (Bajaj)

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const Minimap = memo(function Minimap() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafIdRef = useRef<number>(0);
    const lastFrameTimeRef = useRef(0);

    const playerPosRef = useRef({ x: 0, z: 0 });
    const playerRotRef = useRef(0);

    const showMinimap = useGameStore((state) => state.ui.showMinimap);

    const getCanvasSize = useCallback(() => {
        if (isMobile) {
            return isExpanded ? CANVAS_SIZE_MOBILE_EXPANDED : CANVAS_SIZE_MOBILE_COLLAPSED;
        }
        return isExpanded ? CANVAS_SIZE_EXPANDED : CANVAS_SIZE_COLLAPSED;
    }, [isMobile, isExpanded]);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // M key toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if ((e.target as HTMLElement)?.isContentEditable) return; // Consistency with useEasterEggs.ts
            if (e.code === 'KeyM') setIsExpanded((prev) => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Subscribe to player state via store
    useEffect(() => {
        const unsubscribe = useGameStore.subscribe((state) => {
            playerPosRef.current = { x: state.player.position.x, z: state.player.position.z };
            playerRotRef.current = state.player.rotation;
        });
        return () => unsubscribe();
    }, []);

    // Canvas rendering loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const canvasSize = getCanvasSize();

        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.scale(dpr, dpr);

        const scale = canvasSize / CANVAS_SIZE_COLLAPSED;
        const center = canvasSize / 2;
        const mapScale = canvasSize / WORLD_SIZE;

        /**
         * World to Canvas coordinate transform
         * - Player is centered
         * - Map rotates opposite to player heading (GTA style)
         * 
         * Physics:
         * - rotationY = 0 → player faces -Z (north in Three.js)
         * - The map rotates by -rotationY so north appears at correct angle
         */
        const worldToCanvas = (worldX: number, worldZ: number): { x: number; y: number } => {
            const playerX = playerPosRef.current.x;
            const playerZ = playerPosRef.current.z;
            const rotation = playerRotRef.current;

            // Relative to player
            const relX = worldX - playerX;
            const relZ = worldZ - playerZ;

            // Rotate map by -rotation (when player turns right, map turns left)
            const cos = Math.cos(-rotation);
            const sin = Math.sin(-rotation);
            const rotatedX = relX * cos - relZ * sin;
            const rotatedZ = relX * sin + relZ * cos;

            return {
                x: center + rotatedX * mapScale,
                y: center + rotatedZ * mapScale,
            };
        };

        /**
         * Draw emoji at position
         */
        const drawEmoji = (emoji: string, x: number, y: number, size: number): void => {
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, x, y);
            ctx.restore();
        };

        /**
         * Draw player marker (always at center, but rotated emoji)
         * The player always "faces up" on the minimap
         */
        const drawPlayer = (): void => {
            const size = 18 * scale;
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Add shadow for visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(PLAYER_EMOJI, center, center);
            ctx.restore();
        };

        /**
         * Draw compass indicators (N, E, S, W)
         * All directions ROTATE with player heading
         */
        const drawCompass = (): void => {
            const rotation = playerRotRef.current;
            const radius = canvasSize / 2 - 12 * scale;

            // Compass directions: N=0, E=π/2, S=π, W=3π/2 (relative to north)
            const directions = [
                { label: 'N', offset: 0, color: '#FF6B35', bold: true },
                { label: 'E', offset: Math.PI / 2, color: 'rgba(255, 255, 255, 0.6)', bold: false },
                { label: 'S', offset: Math.PI, color: 'rgba(255, 255, 255, 0.5)', bold: false },
                { label: 'W', offset: (3 * Math.PI) / 2, color: 'rgba(255, 255, 255, 0.6)', bold: false },
            ];

            directions.forEach(({ label, offset, color, bold }) => {
                // Base angle: -π/2 (top) minus player rotation plus direction offset
                const angle = -Math.PI / 2 - rotation + offset;
                const x = center + Math.cos(angle) * radius;
                const y = center + Math.sin(angle) * radius;

                ctx.save();
                ctx.font = `${bold ? 'bold' : 'normal'} ${(bold ? 12 : 10) * scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = color;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 3;
                ctx.fillText(label, x, y);
                ctx.restore();
            });
        };

        /**
         * Draw collectible dot
         */
        const drawCollectibleDot = (x: number, y: number, color: string, pulse: number): void => {
            const baseSize = 3 * scale;
            const size = baseSize + Math.sin(pulse) * 0.5 * scale;

            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 4 * scale;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        /**
         * Draw building marker with emoji and optional glow
         */
        const drawBuilding = (
            x: number, y: number, emoji: string, color: string, visited: boolean
        ): void => {
            const size = 14 * scale;

            ctx.save();

            // Background circle for visibility
            ctx.beginPath();
            ctx.arc(x, y, size / 2 + 2, 0, Math.PI * 2);
            ctx.fillStyle = visited ? color : 'rgba(60, 60, 60, 0.8)';
            ctx.fill();

            // Glow for visited
            if (visited) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 8 * scale;
                ctx.fill();
            }

            // Emoji
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 2;
            ctx.fillText(emoji, x, y);

            ctx.restore();
        };

        /**
         * Main render function
         */
        const render = (timestamp: number): void => {
            // Stop render loop if minimap is hidden
            if (!showMinimap) {
                return;
            }

            // Frame rate limiting
            if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) {
                rafIdRef.current = requestAnimationFrame(render);
                return;
            }
            lastFrameTimeRef.current = timestamp;

            const pulse = timestamp / 500;

            // Clear
            ctx.clearRect(0, 0, canvasSize, canvasSize);

            // Background gradient
            const gradient = ctx.createRadialGradient(center, center, 0, center, center, canvasSize / 2);
            gradient.addColorStop(0, 'rgba(25, 32, 48, 0.92)');
            gradient.addColorStop(0.7, 'rgba(18, 24, 38, 0.96)');
            gradient.addColorStop(1, 'rgba(12, 16, 28, 1)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(center, center, canvasSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Apply circular clipping for all subsequent drawing
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, canvasSize / 2 - 2, 0, Math.PI * 2);
            ctx.clip();

            // Grid lines
            ctx.save();
            ctx.strokeStyle = 'rgba(50, 60, 80, 0.2)';
            ctx.lineWidth = 1;
            const gridSpacing = canvasSize / 5;
            for (let i = 1; i < 5; i++) {
                const pos = i * gridSpacing;
                ctx.beginPath();
                ctx.moveTo(pos, 0);
                ctx.lineTo(pos, canvasSize);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, pos);
                ctx.lineTo(canvasSize, pos);
                ctx.stroke();
            }
            ctx.restore();

            // Collectibles (uncollected only)
            const currentCollected = useCollectibleStore.getState().collected;
            COLLECTIBLES.forEach((collectible) => {
                if (currentCollected.has(collectible.id)) return;

                const pos = worldToCanvas(collectible.position[0], collectible.position[2]);
                const distFromCenter = Math.hypot(pos.x - center, pos.y - center);

                if (distFromCenter < canvasSize / 2 - 5) {
                    const color = COLLECTIBLE_COLORS[collectible.type] || '#FFFFFF';
                    drawCollectibleDot(pos.x, pos.y, color, pulse);
                }
            });

            // Reset zone
            const resetPos = worldToCanvas(RESET_ZONE.position[0], RESET_ZONE.position[1]);
            const resetDist = Math.hypot(resetPos.x - center, resetPos.y - center);
            if (resetDist < canvasSize / 2 - 8) {
                drawEmoji(RESET_ZONE.emoji, resetPos.x, resetPos.y, 12 * scale);
            }

            // Buildings
            const currentVisited = useGameStore.getState().game.visitedBuildings;
            BUILDINGS_CONFIG.forEach((building) => {
                const pos = worldToCanvas(building.position[0], building.position[1]);
                const distFromCenter = Math.hypot(pos.x - center, pos.y - center);

                if (distFromCenter < canvasSize / 2 - 10) {
                    const isVisited = currentVisited.includes(building.id);
                    drawBuilding(pos.x, pos.y, building.emoji, building.color, isVisited);
                }
            });

            // Player (always center)
            drawPlayer();

            // Compass N indicator (rotates with player heading)
            drawCompass();

            // Restore from circular clipping
            ctx.restore();

            rafIdRef.current = requestAnimationFrame(render);
        };

        rafIdRef.current = requestAnimationFrame(render);

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [getCanvasSize, showMinimap]);

    if (!showMinimap) return null;

    const canvasSize = getCanvasSize();

    return (
        <div className={`minimap ${isExpanded ? 'minimap--expanded' : 'minimap--collapsed'}`}>
            <div className="minimap__frame">
                <canvas
                    ref={canvasRef}
                    className="minimap__canvas"
                    style={{ width: canvasSize, height: canvasSize }}
                    aria-label="Minimap showing player position and nearby locations"
                />
                {/* Compass is now drawn ON the canvas, not as HTML */}
            </div>
            <span className="minimap__hint">Press M to {isExpanded ? 'collapse' : 'expand'}</span>
        </div>
    );
});

export default Minimap;
