#!/bin/bash
# =============================================================================
# SRB Dashboard Deploy Script
# =============================================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
OK="${GREEN}✅${NC}"; ERR="${RED}❌${NC}"; WARN="${YELLOW}⚠️${NC}"

SECRETS_FILE="/home/ubuntu/wlp/secrets/tokens.env"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🦏 SRB Dashboard Deploy"
echo "================================"

# ── Load tokens ───────────────────────────────────────
if [ -f "$SECRETS_FILE" ]; then
  source "$SECRETS_FILE"
fi

# ── Validate Vercel token ─────────────────────────────
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${ERR} No VERCEL_TOKEN found."
  exit 1
fi

VC_CHECK=$(curl -sf -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v2/user" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('user',{}).get('email','INVALID'))" 2>/dev/null || echo "INVALID")
if [ "$VC_CHECK" = "INVALID" ]; then
  echo -e "${ERR} Vercel token is expired or invalid."
  exit 1
fi
echo -e "${OK} Vercel token valid — $VC_CHECK"

# ── Ensure Vercel CLI is auth'd ───────────────────────
mkdir -p ~/.local/share/com.vercel.cli
echo "{\"token\":\"${VERCEL_TOKEN}\"}" > ~/.local/share/com.vercel.cli/auth.json

# ── Sync with remote before committing ─────────────────
cd "$PROJECT_DIR"
# GitHub is the source of truth. Rebase local work so remote-only dashboard
# changes cannot be overwritten by a pre-deploy sync.
if [ "$1" != "--skip-push" ]; then
  git fetch origin main
  if ! git diff --quiet || [ -n "$(git status --porcelain)" ]; then
    git stash push --include-untracked -m "pre-deploy-local-work" >/dev/null
    git rebase origin/main
    git stash pop >/dev/null || true
  else
    git rebase origin/main
  fi
fi

# ── Commit pending changes if any ─────────────────────
PENDING=$(git status --short | wc -l | tr -d ' ')
if [ "$PENDING" -gt 0 ] && [ "$1" != "--skip-push" ]; then
  if [ -n "$GITHUB_TOKEN" ]; then
    GH_USER=$(curl -sf -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/user" | python3 -c "import json,sys; print(json.load(sys.stdin).get('login',''))" 2>/dev/null)
    git remote set-url origin "https://${GH_USER}:${GITHUB_TOKEN}@github.com/Animal71Animal/SRB-Dashboard.git"
    git add -A
    git commit -m "chore: pre-deploy sync $(date +%Y-%m-%d)"
    git push origin main
    echo -e "${OK} $PENDING files committed and pushed"
  else
    echo -e "${WARN} Skipping git push (no GITHUB_TOKEN)"
  fi
fi

# ── Ensure GITHUB_TOKEN is set on Vercel project (idempotent) ──
SRB_PROJECT_ID="${SRB_PROJECT_ID:-prj_Adgp3KjYaliK0gAUUBnATDKO7XTN}"
if [ -n "$GITHUB_TOKEN" ]; then
  EXISTING=$(curl -sf -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/${SRB_PROJECT_ID}/env/GITHUB_TOKEN" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('value',''))" 2>/dev/null || echo "")
  if [ -z "$EXISTING" ]; then
    curl -sf -X POST -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
      "https://api.vercel.com/v10/projects/${SRB_PROJECT_ID}/env" \
      -d "{\"key\":\"GITHUB_TOKEN\",\"value\":\"${GITHUB_TOKEN}\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\",\"development\"]}" \
      > /dev/null 2>&1 && echo -e "${OK} GITHUB_TOKEN set on Vercel SRB project"
  fi
fi

# ── Deploy to Vercel ──────────────────────────────────
echo ""
echo "Deploying to Vercel..."
# Use SRB project ID explicitly — VERCEL_PROJECT_ID in tokens.env is Mission Control
DEPLOY_OUTPUT=$(VERCEL_TOKEN="$VERCEL_TOKEN" \
  VERCEL_ORG_ID="$VERCEL_ORG_ID" \
  VERCEL_PROJECT_ID="$SRB_PROJECT_ID" \
  npx vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN" 2>&1 | tee /tmp/torch-deploy.log)
echo "$DEPLOY_OUTPUT"

# Extract production URL — prefer the alias (canonical), fall back to first URL
PROD_URL=$(echo "$DEPLOY_OUTPUT" | grep -A1 "Aliased" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)
if [ -z "$PROD_URL" ]; then
  PROD_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | grep -v 'vercel\.com/v' | head -1)
fi
if [ -z "$PROD_URL" ]; then
  # Fall back to known canonical alias
  PROD_URL="https://srb-dashboard-tau.vercel.app"
fi

echo ""
echo "================================"
echo -e "${OK} Deployment complete!"
echo ""
echo "🌐 LIVE URL: ${PROD_URL}"
echo "================================"
