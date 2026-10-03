# SRB Dashboard — Disaster Recovery Runbook

Last updated: 2026-10-03
Production URL: https://srb-dashboard-ten.vercel.app

This dashboard is a Next.js app. It depends on three platforms:

1. **GitHub** (`Animal71Animal/SRB-Dashboard`) — source code AND all app data
   (stored as JSON files in the repo via the Contents API). If GitHub is
   intact, nothing is truly lost.
2. **Vercel** — hosting. Project config (env vars) lives here and is NOT
   backed up anywhere else.
3. **Abacus AI** — the Ignite panic-button app and the TorchTV app, embedded
   as iframes and called server-side.

---

## Scenario 1: Vercel project deleted or broken

Vercel deletions are permanent — there is no restore, no trash. Rebuild:

1. Vercel dashboard → Add New → Project → import
   `Animal71Animal/SRB-Dashboard` from GitHub.
2. Keep the project name `srb-dashboard`. Renaming changes the URL (see step 6).
3. Framework preset is auto-detected (Next.js). Leave build settings as-is.
4. **Before deploying**, add environment variables
   (Settings → Environment Variables). See `.env.example` for the full list:
   - `GITHUB_TOKEN` — GitHub personal access token (fine-grained, Contents:
     read & write on this repo). Powers the entire data layer. Without it,
     no data loads or saves.
   - `PANIC_SVC_KEY` — shared secret for the Ignite panic handshake. **Must
     exactly match** the secret stored in the Ignite Abacus app. Without it,
     panic alerts silently stop appearing (routes fail closed). If the value
     is lost, see Scenario 2.
   - `GITHUB_REPO` — optional, defaults to `Animal71Animal/SRB-Dashboard`.
   - `IGNITE_BASE_URL` — optional, defaults to `https://ignite.abacusai.cloud`.
5. Deploy. Note: any env var added or changed after a deploy requires a
   redeploy to take effect (Deployments → ⋯ → Redeploy).
6. The new deployment gets a new `*.vercel.app` URL. Update:
   - Staff bookmarks on all work computers (the old URL is dead).
   - **Allowed Iframe Origins** on the TorchTV and Ignite Abacus apps, or
     the embeds show "refused to connect".
7. Verify: open the site, log in, confirm data loads. Then verify the panic
   handshake (Scenario 3).

## Scenario 2: PANIC_SVC_KEY lost

The key must match on both sides: Vercel (`PANIC_SVC_KEY`) and the Ignite
Abacus app (stored in the app's unit file, not in `.env`, not logged).

1. Generate a new secret: `openssl rand -hex 32`
2. Vercel → project → Settings → Environment Variables → set
   `PANIC_SVC_KEY` → Redeploy.
3. In Abacus, open the Ignite app → ask the Abacus AI agent: "Update the
   secret used to validate the X-Panic-Key header on
   `/api/panic/active-svc` to: `<new value>`."
4. Verify with Scenario 3.
5. Store the new value in the team's password manager / secrets file.
   **Do NOT commit it to git.**

## Scenario 3: Verify the panic handshake

```bash
# Should return [] with HTTP 200 (no active panics):
curl https://<your-vercel-url>/api/ignite-panic/active

# Should return {"ok":true} with HTTP 200 — proves the keys match.
# {"ok":false,"error":"not_configured"} (503) = key missing in Vercel.
# {"ok":false,"error":"upstream"} (502)   = keys don't match.
curl -X POST https://<your-vercel-url>/api/ignite-panic/resolve \
  -H "Content-Type: application/json" -d '{"id": 999999}'
```

(The dummy id `999999` is safe — resolving a nonexistent panic is a no-op.)

## Scenario 4: GitHub repo compromised or deleted

- Restore from any local clone (`git clone` copies are full backups —
  keep one on a second machine and pull periodically).
- Re-create the repo, push, then follow Scenario 1 to reconnect Vercel.

## What NOT to worry about

- The Ignite and TorchTV Abacus apps are unaffected by Vercel problems.
- Staff phones using the Ignite app directly are unaffected by dashboard outages.
- Deleting a Vercel project never touches the GitHub repo.
