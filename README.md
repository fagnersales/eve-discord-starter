# eve Discord Starter

A minimal production starter for an eve agent that responds to Discord
`@mentions`. The agent runs on Vercel, a lightweight Discord Gateway process
runs on your own machine, and Convex keeps Discord conversations attached to
durable eve sessions.

```text
Discord -> local gateway -> Vercel eve agent
                         -> Convex session mapping
```

This architecture is useful when you want normal Discord messages and threads,
not slash commands. eve also offers a native Discord channel for interaction-
based bots; see <https://eve.dev/docs/channels/discord> if that fits better.

## What You Get

- Replies only when the bot is mentioned
- Separate conversation history for every channel or thread
- Session mappings that survive gateway restarts
- Serialized turns so simultaneous messages do not corrupt a conversation
- Automatic recovery when a stored eve session no longer exists
- Chunked Discord replies with mentions disabled
- Vercel OIDC, local development, and gateway Basic authentication
- A systemd unit template for keeping the local gateway online

## Requirements

- Node.js 24 and pnpm
- A GitHub account
- A Vercel account
- A Convex account
- A Discord server where you can install an application

## 1. Create The Discord Bot

1. Open <https://discord.com/developers/applications> and create an application.
2. Open **Bot**, create the bot, and copy its token.
3. Under **Privileged Gateway Intents**, enable **Message Content Intent**.
4. Open **OAuth2 > URL Generator**.
5. Select the `bot` scope.
6. Select `View Channels`, `Send Messages`, `Read Message History`, and
   `Send Messages in Threads`.
7. Open the generated URL and add the bot to your server.

Never commit the bot token. It belongs only in the gateway machine's
`.env.local`.

## 2. Install And Configure Convex

```sh
pnpm install
pnpm convex dev
```

The Convex CLI will ask you to log in and create or select a project. Keep it
running until it has deployed `convex/schema.ts` and `convex/sessions.ts`. It
creates `.env.local` with values similar to:

```dotenv
CONVEX_DEPLOYMENT=dev:your-deployment
CONVEX_URL=https://your-deployment.convex.cloud
```

For a persistent gateway, use the production Convex deployment URL. Deploy the
functions and print that URL with:

```sh
pnpm convex deploy
```

Then set the production `CONVEX_URL` in `.env.local`. Convex stores only the
Discord conversation key and eve session ID; message content stays in eve.

## 3. Link And Deploy The eve Agent

Link this directory to a Vercel project:

```sh
pnpm eve link
```

This configures the Vercel project and pulls local model credentials. Choose a
model in `agent/agent.ts`, then verify and deploy:

```sh
pnpm typecheck
pnpm build
pnpm dlx vercel deploy --prod --yes
```

Add `EVE_GATEWAY_PASSWORD` to the Vercel production environment. Generate a
strong value locally rather than inventing a memorable password:

```sh
openssl rand -base64 32
pnpm dlx vercel env add EVE_GATEWAY_PASSWORD production
pnpm dlx vercel deploy --prod --yes
```

The second deployment is required because environment changes do not alter an
already-built deployment. Verify the backend at:

```sh
curl https://YOUR_PROJECT.vercel.app/eve/v1/health
```

The health route should respond even though agent session routes require auth.

## 4. Configure The Local Gateway

Copy the variable names from `.env.example` into `.env.local` and fill them in:

```dotenv
DISCORD_BOT_TOKEN=your-discord-bot-token
EVE_GATEWAY_PASSWORD=the-same-value-stored-on-vercel
EVE_HOST=https://YOUR_PROJECT.vercel.app
CONVEX_URL=https://your-production-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-production-deployment
```

Protect the file and start the listener:

```sh
chmod 600 .env.local
pnpm gateway
```

Mention the bot in a server channel:

```text
@YourBot hello
```

Discord threads have distinct channel IDs, so each thread receives its own eve
session automatically.

## Local Development

Run Convex and eve in separate terminals:

```sh
pnpm convex dev
pnpm dev
```

Set `EVE_HOST=http://127.0.0.1:3000` in `.env.local`, then run the gateway in a
third terminal:

```sh
pnpm gateway
```

`localDev()` allows the eve TUI to access the development server. The gateway
still uses the same Basic authentication path as production.

## Keep The Gateway Running With systemd

Edit `deploy/eve-discord-starter-gateway.service` and replace `YOUR_USER`, the
working directory, and the exact Node 24 installation path. Locate binaries
with `command -v node` and `command -v pnpm` while Node 24 is active.

Install and start the service:

```sh
sudo cp deploy/eve-discord-starter-gateway.service \
  /etc/systemd/system/eve-discord-starter-gateway.service
sudo systemctl daemon-reload
sudo systemctl enable --now eve-discord-starter-gateway
sudo systemctl status eve-discord-starter-gateway
```

Follow logs with:

```sh
sudo journalctl -fu eve-discord-starter-gateway
```

After pulling an update:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm dlx vercel deploy --prod --yes
sudo systemctl restart eve-discord-starter-gateway
```

## Customize The Agent

- Change the model in `agent/agent.ts`.
- Change behavior in `agent/instructions.md`.
- Add eve tools under `agent/tools/`.
- Add Discord metadata through the `clientContext` option in
  `gateway/eve-sessions.ts` if your tools need channel or user context.

Read the installed eve guides under `node_modules/eve/docs/` before adding eve
features. Search the integration registry before implementing a new channel:

```sh
pnpm eve registry search <query> --json
pnpm eve registry view <item>
```

## Security Notes

- Do not expose the local Discord Gateway listener; it makes outbound
  connections only.
- Use different Discord tokens and Convex deployments for development and
  production.
- Rotate both copies of `EVE_GATEWAY_PASSWORD` if either machine is compromised.
- The bot ignores messages from bots and disables mentions in generated output.
- Restrict Discord permissions to only the channels the assistant should read.

## Troubleshooting

**The bot is online but ignores mentions:** enable Message Content Intent in the
Discord developer portal and verify channel permissions.

**The gateway gets `401 Unauthorized`:** make sure `EVE_GATEWAY_PASSWORD` is
identical locally and in Vercel, then redeploy after changing the Vercel value.

**Convex reports a missing function:** run `pnpm convex dev` or
`pnpm convex deploy` so `sessions:get`, `sessions:set`, and `sessions:remove`
are deployed.

**eve rejects the Node version:** activate Node 24 before running pnpm. The
project intentionally declares `node: 24.x` to match eve's runtime requirement.

## License

MIT
