# Adding SpokPay Tools

A SpokPay tool is always a two-repo change: the operation is exposed in the
**spokpay** backend, then consumed by the eve agent in the **spoki** repo
(`/home/yagas-pc/work/spoki`). The wiring already exists — follow it.

```text
Discord -> spoki gateway -> eve agent (spoki repo)
                              └─ agent/tools/<tool>.ts
                                   └─ agent/lib/spokpay.ts
                                        └─ POST/GET /spoki/v1/... on spokpay Convex
                                             └─ convex/spoki/routes.ts (SPOKI_SERVICE_SECRET, per-Discord-user permission)
```

## Where to look

- `spokpay/convex/spoki/` — how to use the spokpay side (domain functions,
  routes, permission logic).
- `spoki/agent/tools/` — how tools are written.
- `spoki/agent/lib/` — the HTTP client helpers and Discord caller identity.

## Process

### 1. spokpay repo

1. Add the domain function in `convex/spoki/` (e.g. `catalogs.ts`).
   Reuse existing permission logic — everything is scoped by `discordUserId`,
   never by a raw admin secret.
2. Add the handler and register the route in `convex/spoki/routes.ts`
   (`registerSpokiRoutes`). Follow the existing JSON error-code convention
   (`unauthorized`, `invalid_payload`, `forbidden`, …).
3. Deploy: `pnpm convex deploy`. The route must be live before the tool ships.

### 2. spoki repo

1. Add the response Zod schema and fetch helper in `agent/lib/spokpay.ts`.
2. Add the tool in `agent/tools/<name>.ts` (filename = tool name). Resolve the
   caller with `requireDiscordCaller(ctx)` and write the description in the
   same style/language as the existing tools.
3. `pnpm typecheck && pnpm build`, then deploy the agent.

### 3. Verify

- `curl https://<agent>/eve/v1/info` lists the new tool.
- Live Discord test with two different users: one with permission, one without
  (must get the permission error, not a stack trace).

## Checklist

- [ ] spokpay: function in `convex/spoki/`, route registered in `routes.ts`
- [ ] spokpay: `pnpm convex deploy`
- [ ] spoki: helper + schema in `agent/lib/spokpay.ts`
- [ ] spoki: tool in `agent/tools/<name>.ts`, caller via `requireDiscordCaller`
- [ ] spoki: typecheck, build, deploy
- [ ] Both permission paths tested from Discord
