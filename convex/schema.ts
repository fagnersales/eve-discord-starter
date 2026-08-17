import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversationSessions: defineTable({
    conversationKey: v.string(),
    eveSessionId: v.string(),
    streamIndex: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_conversation_key", ["conversationKey"]),
});
