import { ClientError } from "eve/client";
import { getSessionId, removeSessionId, setSessionId } from "./convex.ts";
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
  const sessionId = await getSessionId(conversationKey);
  let response;

  if (sessionId) {
    try {
      response = await eve.sessions.attach(sessionId).send(input);
    } catch (error) {
      if (!(error instanceof ClientError)) throw error;
      await removeSessionId(conversationKey);
    }
  }

  if (!response) {
    const created = await eve.sessions.create({ message: input });
    await setSessionId(conversationKey, created.session.state.sessionId);
    response = created.response;
  }

  const result = await response.result();
  if (result.status === "failed") throw new Error("The eve turn failed");
  return result.message;
}
