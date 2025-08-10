#!/usr/bin/env bash
set -euo pipefail

# Load env
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/deploy.env"
else
  echo "Missing $SCRIPT_DIR/deploy.env. Copy deploy.env.example and fill values." >&2
  exit 1
fi

# Ensure we run docker builds from the repo root
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_ROOT="$(git rev-parse --show-toplevel)"
else
  REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi
cd "$REPO_ROOT"
echo "Using repo root: $REPO_ROOT"

# Defaults
BUILD_PLATFORM=${BUILD_PLATFORM:-linux/amd64}
FRONTEND_ECR_REGION=${FRONTEND_ECR_REGION:-us-west-1}
FRONTEND_APP_RUNNER_REGION=${FRONTEND_APP_RUNNER_REGION:-us-west-2}
FRONTEND_ECR_REPO=${FRONTEND_ECR_REPO:?Set FRONTEND_ECR_REPO in deploy.env}

IMAGE_TAG=latest
IMAGE_URI="$FRONTEND_ECR_REPO:$IMAGE_TAG"

# Build args for frontend
BUILD_ARGS=()
if [[ -n "${VITE_API_BASE:-}" ]]; then BUILD_ARGS+=(--build-arg VITE_API_BASE="$VITE_API_BASE"); fi
if [[ -n "${VITE_WS_BASE:-}" ]]; then BUILD_ARGS+=(--build-arg VITE_WS_BASE="$VITE_WS_BASE"); fi

echo "Building frontend/gateway image: $IMAGE_URI (platform=$BUILD_PLATFORM)"
docker buildx build --platform "$BUILD_PLATFORM" \
  -t "$IMAGE_URI" \
  -f apps/patient-platform/patient-server/Dockerfile \
  ${BUILD_ARGS[@]:-} \
  --push .

# Trigger App Runner deploy
SERVICE_ARN="${FRONTEND_APP_RUNNER_SERVICE_ARN:-}"
if [[ -z "$SERVICE_ARN" ]]; then
  echo "Resolving App Runner service ARN for name: $FRONTEND_APP_RUNNER_SERVICE_NAME in $FRONTEND_APP_RUNNER_REGION"
  set +e
  SERVICE_ARN=$(aws apprunner list-services --region "$FRONTEND_APP_RUNNER_REGION" \
    --query "ServiceSummaryList[?ServiceName=='$FRONTEND_APP_RUNNER_SERVICE_NAME'].ServiceArn | [0]" --output text 2>/dev/null)
  LIST_EXIT=$?
  set -e
  if [[ $LIST_EXIT -ne 0 || -z "$SERVICE_ARN" || "$SERVICE_ARN" == "None" ]]; then
    echo "Could not auto-resolve service ARN (permission or not found)."
    read -r -p "Enter App Runner service ARN for frontend/gateway: " SERVICE_ARN
  fi
fi

if [[ -z "$SERVICE_ARN" || "$SERVICE_ARN" == "None" ]]; then
  echo "Service ARN not provided. Aborting." >&2
  exit 1
fi

echo "Triggering App Runner deployment for $SERVICE_ARN"
aws apprunner start-deployment --region "$FRONTEND_APP_RUNNER_REGION" --service-arn "$SERVICE_ARN" >/dev/null

echo "Frontend/gateway redeploy triggered. It may take a few minutes to roll out." 