# Adding SpokPay Tools

A SpokPay tool depends on a route that already exists in the **spokpay**
backend; the agent side lives in the **spoki** repo
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

### 1. Find the corresponding route

Check `spokpay/convex/spoki/` for a route that already serves the operation
the new tool needs.

- **Found it** — continue to step 2, spoki side only.
- **Not found** — stop. Do not build anything on the spokpay side. Tell the
  user which route is missing and ask them to finish that part on spokpay
  beforehand; resume once it is deployed.

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

- [ ] Corresponding route found in `spokpay/convex/spoki/` (or user finished it first)
- [ ] spoki: helper + schema in `agent/lib/spokpay.ts`
- [ ] spoki: tool in `agent/tools/<name>.ts`, caller via `requireDiscordCaller`
- [ ] spoki: typecheck, build, deploy
- [ ] Both permission paths tested from Discord
