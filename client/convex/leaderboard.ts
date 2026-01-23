/**
 * Leaderboard Functions
 * Mutations and queries for global speedrun leaderboard
 * @module convex/leaderboard
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/**
 * Leaderboard entry validator for return types
 */
const leaderboardEntryValidator = v.object({
    _id: v.id("leaderboard"),
    _creationTime: v.number(),
    visitorId: v.string(),
    nickname: v.string(),
    speedRunTime: v.number(),
    completionPercent: v.number(),
    submittedAt: v.number(),
});

/**
 * Get top scores sorted by fastest time
 * Default limit is 10 entries
 */
export const getTopScores = query({
    args: { limit: v.optional(v.number()) },
    returns: v.array(leaderboardEntryValidator),
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;

        // Use index for sorted retrieval
        const entries = await ctx.db
            .query("leaderboard")
            .withIndex("by_time")
            .order("asc") // Fastest times first
            .take(limit);

        return entries;
    },
});

/**
 * Get a player's best score
 */
export const getPlayerScore = query({
    args: { visitorId: v.string() },
    returns: v.union(leaderboardEntryValidator, v.null()),
    handler: async (ctx, args) => {
        // Find player's best score using index
        const entries = await ctx.db
            .query("leaderboard")
            .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
            .first();

        return entries ?? null;
    },
});

/**
 * Submit a score to the leaderboard
 * Validates 100% completion before accepting
 * Only keeps best score per player
 */
export const submitScore = mutation({
    args: {
        visitorId: v.string(),
        nickname: v.string(),
        speedRunTime: v.number(),
        completionPercent: v.number(),
    },
    returns: v.object({
        success: v.boolean(),
        message: v.string(),
        rank: v.optional(v.number()),
    }),
    handler: async (ctx, args) => {
        // Validate 100% completion requirement
        if (args.completionPercent < 100) {
            throw new ConvexError({
                code: "INCOMPLETE",
                message: "Must have 100% completion to submit to leaderboard",
            });
        }

        // Validate nickname length
        if (args.nickname.length < 1 || args.nickname.length > 20) {
            throw new ConvexError({
                code: "INVALID_NICKNAME",
                message: "Nickname must be 1-20 characters",
            });
        }

        // Validate speedRunTime is positive
        if (args.speedRunTime <= 0) {
            throw new ConvexError({
                code: "INVALID_TIME",
                message: "Speed run time must be positive",
            });
        }

        // Check for existing score by this player using index
        const existing = await ctx.db
            .query("leaderboard")
            .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
            .first();

        if (existing) {
            // Only update if new time is better
            if (args.speedRunTime < existing.speedRunTime) {
                await ctx.db.patch(existing._id, {
                    nickname: args.nickname,
                    speedRunTime: args.speedRunTime,
                    submittedAt: Date.now(),
                });

                // Calculate new rank
                const betterScores = await ctx.db
                    .query("leaderboard")
                    .withIndex("by_time")
                    .filter((q) => q.lt(q.field("speedRunTime"), args.speedRunTime))
                    .collect();

                return {
                    success: true,
                    message: "New personal best!",
                    rank: betterScores.length + 1,
                };
            } else {
                return {
                    success: false,
                    message: `Your best time is ${formatTime(existing.speedRunTime)}`,
                };
            }
        } else {
            // Insert new score
            await ctx.db.insert("leaderboard", {
                visitorId: args.visitorId,
                nickname: args.nickname,
                speedRunTime: args.speedRunTime,
                completionPercent: args.completionPercent,
                submittedAt: Date.now(),
            });

            // Calculate rank
            const betterScores = await ctx.db
                .query("leaderboard")
                .withIndex("by_time")
                .filter((q) => q.lt(q.field("speedRunTime"), args.speedRunTime))
                .collect();

            return {
                success: true,
                message: "Score submitted!",
                rank: betterScores.length + 1,
            };
        }
    },
});

/**
 * Helper to format time as MM:SS.mmm
 */
function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
}
