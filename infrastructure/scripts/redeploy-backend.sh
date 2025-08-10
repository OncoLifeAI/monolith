#!/usr/bin/env bash
set -euo pipefail

# Fly.io deploy for backend API (root-level toml to ensure correct build context)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

if ! command -v fly >/dev/null 2>&1; then
  echo "flyctl not found. Install from https://fly.io/docs/hands-on/install-flyctl/" >&2
  exit 1
fi

APP_NAME=${FLY_APP_NAME:-oncolife-patient-api}

if ! fly apps list | grep -q "^$APP_NAME\b"; then
  fly apps create "$APP_NAME"
fi

fly deploy --config fly.patient-api.toml --remote-only --build-only=false --now 