import { ClientError, type ClientSession } from "eve/client";
import { getSessionState, removeSessionId, setSessionState } from "./convex.ts";
import { eve } from "./eve-client.ts";

const queues = new Map<string, Promise<void>>();

export async function askEve(conversationKey: string, input: string) {
  const previous = queues.get(conversationKey) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.catch(() => undefined).then(() => current);
  queues.set(conversationKey, queued);

  await previous.catch(() => undefined);
  try {
    return await runTurn(conversationKey, input);
  } finally {
    release();
    if (queues.get(conversationKey) === queued) queues.delete(conversationKey);
  }
}

async function runTurn(conversationKey: string, input: string) {
  const saved = await getSessionState(conversationKey);
  let session: ClientSession | undefined;
  let response;

  if (saved?.eveSessionId) {
    try {
      session = await attachExisting(saved.eveSessionId, saved.streamIndex);
      await setSessionState(conversationKey, session.state);
      response = await session.send(input);
    } catch (error) {
      if (!(error instanceof ClientError)) throw error;
      await removeSessionId(conversationKey);
      session = undefined;
      response = undefined;
    }
  }

  if (!response) {
    const created = await eve.sessions.create({ message: input });
    session = created.session;
    await setSessionState(conversationKey, session.state);
    response = created.response;
  }

  const result = await response.result();
  if (result.status === "failed") throw new Error("The eve turn failed");

  // Persist the advanced durable stream cursor so the next message does not replay old events.
  await setSessionState(conversationKey, session!.state);
  return result.message;
}

async function attachExisting(sessionId: string, streamIndex: number | undefined): Promise<ClientSession> {
  if (streamIndex != null) {
    return eve.sessions.attach(sessionId, { streamIndex });
  }

  // Migration: this record was created before cursors were persisted. Attach
  // without a cursor would start at 0 and replay the first response. Instead,
  // read a finite snapshot once, take its advanced cursor, and reattach so the
  // next send does not replay an old turn.
  const provisional = eve.sessions.attach(sessionId);
  const snapshot = await provisional.snapshot();
  return eve.sessions.attach(snapshot.session.sessionId, {
    streamIndex: snapshot.session.streamIndex,
  });
}
