# OpenClaw — Gemini model wiring (ready-to-paste)

Apply via the **OpenClaw service tile** on the SuperComputer Homepage (config/providers), so the
gateway reload happens server-side. Do NOT hand-edit the live `~/.openclaw/openclaw.json` — a reload
is required and gateway restarts are platform-coordinated under your policy.

Gateway: OpenClaw 2026.9.8 (fc23bc8) on `vm`. Single provider `abacus` → https://routellm.abacus.ai/v1
(apiKey already set). Gemini is served THROUGH this router — no Google `AIza…` key, no base64, no
prefix, no special env var. Reference models as `abacus/<id>`.

---

## 1. Model entry — add inside `models.providers.abacus.models[]`

(Only add if not already present. `gemini-3.5-flash`, `gemini-3-flash-preview`, `gemini-2.5-pro`,
`gemini-2.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite` are ALREADY in the list.)

```jsonc
{
  "id": "gemini-3.5-flash",
  "name": "Gemini 3.5 Flash",
  "api": "openai-completions",
  "reasoning": true,
  "input": ["text", "image", "audio"],
  "contextWindow": 1000000,
  "maxTokens": 65536,
  "cost": { "input": 0.5, "output": 3, "cacheRead": 0.125, "cacheWrite": 0 }
}
```

Other Gemini IDs available on the router (same `api: openai-completions`):
`gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`, `gemini-3-flash-preview`, `gemini-2.5-pro`,
`gemini-2.5-flash`, plus image models `gemini-2.5-flash-image`, `gemini-3-pro-image-preview`,
`gemini-3.1-flash-image-preview`.

---

## 2. Router references — `agents.defaults`

```jsonc
"agents": {
  "defaults": {
    "model": {
      "primary": "abacus/m2.7",
      "fallbacks": ["abacus/gemini-3.5-flash"]
    },
    "modelPolicy": {
      "allow": [
        "abacus/m2.7",
        "abacus/kimi-k2.6",
        "abacus/gemini-3.5-flash",
        "abacus/gemini-3-flash-preview"
      ]
    }
  }
}
```

---

## 3. Non-router (standalone direct-to-Google) — ONLY if you want separate Google billing

Not needed for your stack. Adds a second key to manage.

```jsonc
"models": {
  "providers": {
    "google": {
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta/openai",
      "apiKey": "<GOOGLE_API_KEY>",   // fill locally; never commit
      "api": "openai-completions",
      "models": [
        {
          "id": "gemini-2.5-flash",
          "name": "Gemini 2.5 Flash (direct)",
          "api": "openai-completions",
          "input": ["text", "image", "audio"],
          "contextWindow": 1000000,
          "maxTokens": 65536
        }
      ]
    }
  }
}
```
Then reference as `google/gemini-2.5-flash`.

---

## Notes
- Current live fallback is already `abacus/gemini-3.5-flash` and it resolves — Gemini is reachable now.
- `abacus/gpt-5.4` does NOT exist under the provider; `abacus/kimi-k2.6` exists but is not wired as the
  fallback. Reconcile against your provisioning doc.
- Update path: on 2026.9.8, stable registry latest is 2026.10.1 — upgrade via the OpenClaw tile.
