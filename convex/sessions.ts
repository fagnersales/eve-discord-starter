import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { conversationKey: v.string() },
  handler: async (ctx, { conversationKey }) =>
    await ctx.db
      .query("conversationSessions")
      .withIndex("by_conversation_key", (q) => q.eq("conversationKey", conversationKey))
      .unique(),
});

export const set = mutation({
  args: { conversationKey: v.string(), eveSessionId: v.string() },
  handler: async (ctx, { conversationKey, eveSessionId }) => {
    const existing = await ctx.db
      .query("conversationSessions")
      .withIndex("by_conversation_key", (q) => q.eq("conversationKey", conversationKey))
      .unique();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { eveSessionId, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("conversationSessions", {
      conversationKey,
      eveSessionId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { conversationKey: v.string() },
  handler: async (ctx, { conversationKey }) => {
    const existing = await ctx.db
      .query("conversationSessions")
      .withIndex("by_conversation_key", (q) => q.eq("conversationKey", conversationKey))
      .unique();

    if (existing) await ctx.db.delete(existing._id);
  },
});
