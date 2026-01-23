/**
 * Progress Sync Functions
 * Mutations and queries for cross-device progress synchronization
 * @module convex/progress
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Progress data validator for return types
 */
const progressValidator = v.union(
    v.object({
        _id: v.id("players"),
        _creationTime: v.number(),
        visitorId: v.string(),
        collectibles: v.array(v.string()),
        achievements: v.array(v.string()),
        visitedBuildings: v.array(v.string()),
        lastSeen: v.number(),
    }),
    v.null()
);

/**
 * Get player progress by visitorId
 * Returns null if player doesn't exist yet
 */
export const getProgress = query({
    args: { visitorId: v.string() },
    returns: progressValidator,
    handler: async (ctx, args) => {
        const player = await ctx.db
            .query("players")
            .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
            .first();

        return player ?? null;
    },
});

/**
 * Sync player progress - upsert pattern
 * Creates new record if player doesn't exist, patches if exists
 * Idempotent: safe to retry on network failures
 */
export const syncProgress = mutation({
    args: {
        visitorId: v.string(),
        collectibles: v.array(v.string()),
        achievements: v.array(v.string()),
        visitedBuildings: v.array(v.string()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("players")
            .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
            .first();

        if (existing) {
            // Merge arrays: union of local and server data
            // This prevents data loss if client syncs stale data
            const mergedCollectibles = [...new Set([
                ...existing.collectibles,
                ...args.collectibles,
            ])];
            const mergedAchievements = [...new Set([
                ...existing.achievements,
                ...args.achievements,
            ])];
            const mergedBuildings = [...new Set([
                ...existing.visitedBuildings,
                ...args.visitedBuildings,
            ])];

            await ctx.db.patch(existing._id, {
                collectibles: mergedCollectibles,
                achievements: mergedAchievements,
                visitedBuildings: mergedBuildings,
                lastSeen: Date.now(),
            });
        } else {
            // Create new player record
            await ctx.db.insert("players", {
                visitorId: args.visitorId,
                collectibles: args.collectibles,
                achievements: args.achievements,
                visitedBuildings: args.visitedBuildings,
                lastSeen: Date.now(),
            });
        }

        return null;
    },
});
