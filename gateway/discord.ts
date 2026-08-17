import { Client, Events, GatewayIntentBits } from "discord.js";
import { replyChunked, startTyping } from "./discord-responses.ts";
import { askEve } from "./eve-sessions.ts";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("DISCORD_BOT_TOKEN is required");

const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

discord.on(Events.ClientReady, (client) => {
  console.log(`Discord gateway connected as ${client.user.tag}`);
});

discord.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const me = message.client.user;
  if (!message.mentions.has(me, { ignoreEveryone: true, ignoreRoles: true })) return;

  const prompt = message.content
    .replaceAll(`<@${me.id}>`, "")
    .replaceAll(`<@!${me.id}>`, "")
    .trim();
  if (!prompt) {
    await message.reply("Say something after the mention.");
    return;
  }

  const stopTyping = startTyping(message);
  try {
    const reply = await askEve(message.channelId, `${message.author.username} says: ${prompt}`);
    await replyChunked(message, reply ?? "The agent completed without a reply.");
  } catch (error) {
    console.error("eve turn failed:", error);
    await replyChunked(message, "The agent could not complete that request.");
  } finally {
    stopTyping();
  }
});

await discord.login(token);
