import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) throw new Error("CONVEX_URL is required");

const convex = new ConvexHttpClient(convexUrl);

export async function getSessionId(conversationKey: string) {
  const session = await convex.query(api.sessions.get, { conversationKey });
  return session?.eveSessionId;
}

export async function setSessionId(conversationKey: string, eveSessionId: string) {
  await convex.mutation(api.sessions.set, { conversationKey, eveSessionId });
}

export async function removeSessionId(conversationKey: string) {
  await convex.mutation(api.sessions.remove, { conversationKey });
}
