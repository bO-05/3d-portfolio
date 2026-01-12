/**
 * Collectible Data - Defines all collectibles in the game
 * 
 * ⚠️ EXCLUSION ZONES - Do NOT place collectibles here:
 * ┌──────────────────────────────────────────────────────┐
 * │ Building          │ Position    │ Exclusion Radius  │
 * │ tech-hub          │ [-25, 0, 0] │ 10 units          │
 * │ art-gallery       │ [-15, 0, 25]│ 10 units          │
 * │ cafe              │ [25, 0, -20]│ 10 units          │
 * │ music-studio      │ [25, 0, 25] │ 10 units          │
 * │ warung            │ [0, 0, -35] │ 10 units          │
 * │ reset-zone        │ [0, 0, 8]   │ 5 units           │
 * └──────────────────────────────────────────────────────┘
 * 
 * @module data/collectibles
 */

export type CollectibleType = 'kopi' | 'target' | 'star' | 'note' | 'orb';
export type ContainerType = 'none' | 'box' | 'bush';

export interface CollectibleData {
    id: string;
    type: CollectibleType;
    position: [number, number, number];
    container: ContainerType;
}

// Visual properties for each collectible type
export const COLLECTIBLE_VISUALS: Record<CollectibleType, {
    emoji: string;
    color: string;
    emissive: string;
    description: string;
}> = {
    kopi: {
        emoji: '☕',
        color: '#8B4513',
        emissive: '#CD853F',
        description: 'Skills Badge',
    },
    target: {
        emoji: '🎯',
        color: '#FF4444',
        emissive: '#FF6666',
        description: 'Project Milestone',
    },
    star: {
        emoji: '⭐',
        color: '#FFD700',
        emissive: '#FFEC8B',
        description: 'Achievement',
    },
    note: {
        emoji: '📝',
        color: '#FFFFFF',
        emissive: '#FFFFCC',
        description: 'About Me',
    },
    orb: {
        emoji: '🔮',
        color: '#9932CC',
        emissive: '#BA55D3',
        description: 'Easter Egg',
    },
};

// All collectibles in the game
// ⚠️ Positions verified to be OUTSIDE building exclusion zones
export const COLLECTIBLES: CollectibleData[] = [
    // ═══════════════════════════════════════════════════════════
    // VISIBLE (no container) - 8 collectibles
    // ═══════════════════════════════════════════════════════════
    { id: 'c1', type: 'kopi', position: [10, 1.5, 10], container: 'none' },
    { id: 'c2', type: 'star', position: [-15, 1.5, -20], container: 'none' },
    { id: 'c3', type: 'target', position: [20, 1.5, -15], container: 'none' },
    { id: 'c4', type: 'note', position: [-20, 1.5, 25], container: 'none' },
    { id: 'c5', type: 'kopi', position: [25, 1.5, 30], container: 'none' },
    { id: 'c6', type: 'star', position: [-30, 1.5, -10], container: 'none' },
    { id: 'c7', type: 'target', position: [30, 1.5, 0], container: 'none' },
    // c8 WAS at [0, 1.5, -35] inside warung - MOVED to accessible location
    { id: 'c8', type: 'note', position: [12, 1.5, -35], container: 'none' },

    // ═══════════════════════════════════════════════════════════
    // HIDDEN IN BOXES (knockable) - 4 collectibles
    // ═══════════════════════════════════════════════════════════
    { id: 'c9', type: 'star', position: [-25, 0.6, 15], container: 'box' },
    { id: 'c10', type: 'kopi', position: [15, 0.6, 20], container: 'box' },
    { id: 'c11', type: 'target', position: [-10, 0.6, -25], container: 'box' },
    { id: 'c12', type: 'note', position: [28, 0.6, -20], container: 'box' },

    // ═══════════════════════════════════════════════════════════
    // HIDDEN IN BUSHES (passable) - 3 collectibles (secrets!)
    // ═══════════════════════════════════════════════════════════
    { id: 'c13', type: 'orb', position: [-38, 0, 28], container: 'bush' },
    { id: 'c14', type: 'orb', position: [38, 0, 38], container: 'bush' },
    { id: 'c15', type: 'star', position: [5, 0, -38], container: 'bush' },
];

export default COLLECTIBLES;
