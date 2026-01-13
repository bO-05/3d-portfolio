/**
 * Achievement Definitions
 * @module data/achievements
 */

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: 'first_drive' | 'engine_master' | 'all_buildings' | 'night_owl' | 'speed_demon' | 'collector' | 'completionist';
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_drive',
        name: 'First Steps',
        description: 'Start the engine and move for the first time',
        icon: '🚗',
        condition: 'first_drive',
    },
    {
        id: 'engine_master',
        name: 'Engine Master',
        description: 'Toggle the engine 10 times',
        icon: '🔧',
        condition: 'engine_master',
    },
    {
        id: 'all_buildings',
        name: 'Explorer',
        description: 'Visit all 5 buildings',
        icon: '🏛️',
        condition: 'all_buildings',
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Play during night mode',
        icon: '🦉',
        condition: 'night_owl',
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Use boost for 10 seconds total',
        icon: '🚀',
        condition: 'speed_demon',
    },
    {
        id: 'collector',
        name: 'Collector',
        description: 'Find 10 collectibles',
        icon: '⭐',
        condition: 'collector',
    },
    {
        id: 'completionist',
        name: 'Completionist',
        description: 'Find all 15 collectibles and visit all buildings',
        icon: '🏆',
        condition: 'completionist',
    },
];

export default ACHIEVEMENTS;
