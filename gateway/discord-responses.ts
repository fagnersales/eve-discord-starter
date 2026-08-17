import type { Message } from "discord.js";

const MESSAGE_LIMIT = 2_000;

export function startTyping(message: Message) {
  const channel = message.channel;
  if (!("sendTyping" in channel)) return () => {};
  const ping = () => channel.sendTyping().catch(() => {});
  ping();
  const interval = setInterval(ping, 8_000);
  return () => clearInterval(interval);
}

export async function replyChunked(message: Message, text: string) {
  const chunks = Array.from(
    { length: Math.ceil(text.length / MESSAGE_LIMIT) },
    (_, index) => text.slice(index * MESSAGE_LIMIT, (index + 1) * MESSAGE_LIMIT),
  );
  let previous = await message.reply({ content: chunks[0] ?? "", allowedMentions: { parse: [] } });
  for (const chunk of chunks.slice(1)) {
    previous = await previous.reply({ content: chunk, allowedMentions: { parse: [] } });
  }
}
