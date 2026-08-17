import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) throw new Error("CONVEX_URL is required");

const convex = new ConvexHttpClient(convexUrl);

export interface ConversationSessionState {
  eveSessionId: string;
  streamIndex?: number;
}

export async function getSessionState(conversationKey: string): Promise<ConversationSessionState | undefined> {
  const session = await convex.query(api.sessions.get, { conversationKey });
  if (!session) return undefined;
  return { eveSessionId: session.eveSessionId, streamIndex: session.streamIndex };
}

export async function setSessionState(conversationKey: string, state: { sessionId: string; streamIndex?: number }) {
  await convex.mutation(api.sessions.set, {
    conversationKey,
    eveSessionId: state.sessionId,
    streamIndex: state.streamIndex,
  });
}

export async function removeSessionId(conversationKey: string) {
  await convex.mutation(api.sessions.remove, { conversationKey });
}
