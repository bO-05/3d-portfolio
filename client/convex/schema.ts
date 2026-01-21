/**
 * Convex Database Schema
 * Defines tables for player progress sync and global leaderboard
 * @module convex/schema
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    /**
     * Player progress - synced across devices
     * Indexed by visitorId for O(1) lookup
     */
    players: defineTable({
        visitorId: v.string(),
        collectibles: v.array(v.string()),
        achievements: v.array(v.string()),
        visitedBuildings: v.array(v.string()),
        lastSeen: v.number(),
    }).index("by_visitor", ["visitorId"]),

    /**
     * Global leaderboard for speedruns
     * Indexed by time for sorted retrieval
     */
    leaderboard: defineTable({
        visitorId: v.string(),
        nickname: v.string(),
        speedRunTime: v.number(), // milliseconds
        completionPercent: v.number(),
        submittedAt: v.number(),
    }).index("by_time", ["speedRunTime"]),
});
