# AI-Assisted Setup

Give the prompt below to a capable coding agent with terminal, GitHub, Convex,
and Vercel access. Replace the bracketed values first when you already know
them; otherwise, the agent should ask only for information it cannot discover
or configure safely.

## Setup Prompt

```text
Set up my own independent Discord agent project using the contents of:

https://github.com/fagnersales/eve-discord-starter

Important repository rule:

- DO NOT fork eve-discord-starter on GitHub.
- DO NOT preserve its Git history or configure it as my repository's upstream.
- Copy or clone the template contents into a new local directory, remove the
  template's .git directory if one was cloned, initialize a fresh Git
  repository, and create a new repository owned by me.
- The resulting repository must have its own initial commit and history. It
  should contain the template code, not be a GitHub fork.

Desired project details:

- Project name: [MY_PROJECT_NAME]
- GitHub owner: [MY_GITHUB_USER_OR_ORG]
- GitHub visibility: [private or public]
- Local parent directory: [LOCAL_PARENT_DIRECTORY]
- Vercel scope/team: [VERCEL_SCOPE]
- Agent model: [MODEL, or keep the template default]

The intended architecture is:

Discord -> local Discord Gateway -> Vercel-hosted eve agent
                                 -> Convex session mapping

Complete the setup end to end where credentials and authenticated CLIs permit.
Read README.md and the relevant installed eve documentation under
node_modules/eve/docs before changing eve-specific code. Use Node.js 24.

Follow this workflow:

1. Confirm that git, gh, pnpm, Node.js 24, the Convex CLI, and the Vercel CLI
   are available. Check authentication without printing tokens or secrets.
2. Obtain the template files without creating a fork or retaining template Git
   history. Create a fresh repository in
   [LOCAL_PARENT_DIRECTORY]/[MY_PROJECT_NAME].
3. Rename user-facing references from eve-discord-starter to my project name,
   including package metadata, README examples, and the systemd unit filename
   and description. Keep framework and dependency names unchanged.
4. Install dependencies and run `pnpm typecheck` and `pnpm build`. Fix any
   failures before continuing.
5. Create a new GitHub repository under [MY_GITHUB_USER_OR_ORG]. Do not use
   `gh repo fork` or GitHub's fork operation. Commit the intended files to a
   fresh `main` branch and push them to the new repository.
6. Configure a new Convex project for this application. Deploy the schema and
   session functions. Use separate development and production deployments
   when practical. Record `CONVEX_URL` and `CONVEX_DEPLOYMENT` only in ignored
   local environment files, never in committed files.
7. Link a new Vercel project under [VERCEL_SCOPE], connect it to the new GitHub
   repository, and deploy the eve backend to production.
8. Generate a strong random `EVE_GATEWAY_PASSWORD`. Store the same value in
   the Vercel production environment and the local gateway's ignored
   `.env.local`. Never display the value in chat, logs, commits, command
   summaries, or documentation. Redeploy Vercel after adding it.
9. Help me create and install a Discord bot if it does not exist. Explain the
   exact Discord Developer Portal steps that require my interaction: create an
   application and bot, enable Message Content Intent, grant only View
   Channels, Send Messages, Read Message History, and Send Messages in Threads,
   and install it in the intended server. Never ask me to paste the bot token
   into chat. Tell me to place it directly in the ignored `.env.local`, or use
   a secure secret input mechanism if one is available.
10. Configure the local gateway with `DISCORD_BOT_TOKEN`,
    `EVE_GATEWAY_PASSWORD`, the production `EVE_HOST`, and production
    `CONVEX_URL`. Set `.env.local` permissions to 600. Do not commit it.
11. Start or smoke-test the gateway, verify the Vercel
    `/eve/v1/health` endpoint, and tell me how to test an @mention in Discord.
12. If I want persistent hosting, customize the included systemd service with
    the real user, path, Node 24 path, and pnpm path. Show me commands requiring
    sudo, but do not run privileged commands without my approval.
13. Inspect `git status` and the committed file list before every push. Confirm
    that no `.env*`, Discord token, gateway password, Convex credential,
    Vercel token, or generated secret is tracked.

Do not replace this architecture with eve's native slash-command Discord
channel. This project intentionally uses a local Discord Gateway listener so it
can respond to ordinary @mentions while the eve backend remains on Vercel and
Convex preserves Discord-to-eve session mappings.

When an interactive login, browser authorization, Discord portal action,
secret entry, or sudo command blocks progress, pause and give me one precise
action at a time. Continue automatically after I confirm completion.

At the end, report:

- Local project path
- New GitHub repository URL and visibility
- Vercel production URL
- Vercel health-check result
- Convex deployment status, without exposing credentials
- Typecheck and build results
- Gateway status
- Any manual Discord or systemd step still required
- Confirmation that this is an independent repository, not a fork
- Confirmation that no secrets are committed
```

## Notes For The User

- Do not paste your Discord bot token or generated gateway password into an AI
  chat. Enter secrets directly into `.env.local` or the provider's protected
  environment-variable prompt.
- The agent may need you to complete browser-based GitHub, Convex, Vercel, or
  Discord authentication.
- Review the final repository and deployment ownership before inviting the bot
  to a production Discord server.
