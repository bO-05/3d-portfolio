/**
 * SpeedrunRings - HIGHLY OPTIMIZED for potato laptops
 * 
 * Performance optimizations:
 * 1. Reduced from 15 to 10 rings
 * 2. NO point lights (very expensive!)
 * 3. meshBasicMaterial instead of meshStandardMaterial (no lighting calculations)
 * 4. Lower polygon count (8 segments instead of 32)
 * 5. Pre-render during countdown phase (invisible) to avoid spawn GPU stall
 * 6. Single centralized useFrame instead of per-ring
 * 7. No refs per ring - use array access
 * 
 * @module components/Scene/SpeedrunRings
 */

import { memo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpeedrunStore } from '../../stores/speedrunStore';
import { useGameStore } from '../../stores/gameStore';

// Ground is 100x100, edges at ±40 (leaving margin from walls)
const EDGE_OFFSET = 38;
const MID_OFFSET = 20;
const CENTER = 0;

/**
 * 10 ring positions - reduced for performance, strategic placement
 * Layout: 4 corners + 4 edges + 1 center + 1 near spawn
 */
const SPEEDRUN_RING_POSITIONS: [number, number, number][] = [
    // 4 corners (straight-line routes)
    [EDGE_OFFSET, 2, EDGE_OFFSET],       // NE
    [-EDGE_OFFSET, 2, EDGE_OFFSET],      // NW  
    [EDGE_OFFSET, 2, -EDGE_OFFSET],      // SE
    [-EDGE_OFFSET, 2, -EDGE_OFFSET],     // SW

    // 4 mid-edges (crossing routes)
    [EDGE_OFFSET, 2, CENTER],            // E
    [-EDGE_OFFSET, 2, CENTER],           // W
    [CENTER, 2, EDGE_OFFSET],            // N
    [CENTER, 2, -EDGE_OFFSET],           // S

    // 2 inner positions
    [MID_OFFSET, 2, MID_OFFSET],         // inner NE
    [-MID_OFFSET, 2, -MID_OFFSET],       // inner SW
];

const COLLECT_RADIUS = 5; // Larger for easier pickup
const COLLECT_RADIUS_SQ = COLLECT_RADIUS * COLLECT_RADIUS;

/**
 * Single static ring mesh - minimal geometry, no lighting
 */
const StaticRing = memo(function StaticRing({
    position,
    collected,
}: {
    position: [number, number, number];
    collected: boolean;
}) {
    // Don't render if collected
    if (collected) return null;

    return (
        <group position={position}>
            {/* Main ring - SIMPLE: low poly, no lighting calc, STANDING VERTICAL */}
            <mesh>
                <torusGeometry args={[2, 0.5, 6, 16]} />
                <meshBasicMaterial
                    color="#00ff88"
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Inner highlight - even simpler */}
            <mesh>
                <torusGeometry args={[2, 0.2, 4, 12]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
        </group>
    );
});

/**
 * Speedrun rings manager - OPTIMIZED
 * Pre-renders during countdown (invisible) to warm GPU cache
 */
export const SpeedrunRings = memo(function SpeedrunRings() {
    const phase = useSpeedrunStore((state) => state.phase);
    const speedrunCollected = useSpeedrunStore((state) => state.speedrunCollected);
    const collectSpeedrunItem = useSpeedrunStore((state) => state.collectSpeedrunItem);
    const playerPosition = useGameStore((state) => state.player.position);

    // Track last collected to avoid re-checking
    const lastCollectedRef = useRef<Set<string>>(new Set());

    // Single centralized proximity check for ALL rings
    useFrame(() => {
        if (phase !== 'running') return;

        for (let i = 0; i < SPEEDRUN_RING_POSITIONS.length; i++) {
            const id = `ring-${i}`;
            if (speedrunCollected.has(id)) continue;
            if (lastCollectedRef.current.has(id)) continue;

            const ringPos = SPEEDRUN_RING_POSITIONS[i];
            if (!ringPos) continue;
            const [px, , pz] = ringPos;
            const dx = playerPosition.x - px;
            const dz = playerPosition.z - pz;
            const distSq = dx * dx + dz * dz;

            if (distSq < COLLECT_RADIUS_SQ) {
                lastCollectedRef.current.add(id);
                collectSpeedrunItem(id);
            }
        }
    });

    // Clear tracking on reset - must be in effect, not render body
    useEffect(() => {
        if (phase === 'idle') {
            lastCollectedRef.current.clear();
        }
    }, [phase]);

    // PRE-RENDER during countdown (invisible) to warm GPU
    // This prevents lag spike when "GO!" appears
    const isVisible = phase === 'running';

    // Don't render at all if idle
    if (phase === 'idle' || phase === 'ready' || phase === 'entering_initials') {
        return null;
    }

    return (
        <group visible={isVisible}>
            {SPEEDRUN_RING_POSITIONS.map((pos, index) => {
                const id = `ring-${index}`;
                return (
                    <StaticRing
                        key={id}
                        position={pos}
                        collected={speedrunCollected.has(id)}
                    />
                );
            })}
        </group>
    );
});

export const SPEEDRUN_RING_COUNT = SPEEDRUN_RING_POSITIONS.length;
export default SpeedrunRings;
