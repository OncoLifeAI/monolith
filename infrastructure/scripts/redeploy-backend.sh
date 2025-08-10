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
BACKEND_ECR_REGION=${BACKEND_ECR_REGION:-us-west-1}
BACKEND_APP_RUNNER_REGION=${BACKEND_APP_RUNNER_REGION:-us-west-2}
BACKEND_ECR_REPO=${BACKEND_ECR_REPO:?Set BACKEND_ECR_REPO in deploy.env}

IMAGE_TAG=latest
IMAGE_URI="$BACKEND_ECR_REPO:$IMAGE_TAG"

echo "Building backend image: $IMAGE_URI (platform=$BUILD_PLATFORM)"
docker buildx build --platform "$BUILD_PLATFORM" \
  -t "$IMAGE_URI" \
  -f apps/patient-platform/patient-api/Dockerfile \
  --push .

# Trigger App Runner deploy
if [[ -n "${BACKEND_APP_RUNNER_SERVICE_ARN:-}" ]]; then
  SERVICE_ARN="$BACKEND_APP_RUNNER_SERVICE_ARN"
else
  echo "Resolving App Runner service ARN for name: $BACKEND_APP_RUNNER_SERVICE_NAME in $BACKEND_APP_RUNNER_REGION"
  SERVICE_ARN=$(aws apprunner list-services --region "$BACKEND_APP_RUNNER_REGION" \
    --query "ServiceSummaryList[?ServiceName=='$BACKEND_APP_RUNNER_SERVICE_NAME'].ServiceArn | [0]" --output text)
fi

if [[ -z "$SERVICE_ARN" || "$SERVICE_ARN" == "None" ]]; then
  echo "Failed to resolve App Runner service ARN. Set BACKEND_APP_RUNNER_SERVICE_ARN in deploy.env or ensure the service exists." >&2
  exit 1
fi

echo "Triggering App Runner deployment for $SERVICE_ARN"
aws apprunner start-deployment --region "$BACKEND_APP_RUNNER_REGION" --service-arn "$SERVICE_ARN" >/dev/null

echo "Backend redeploy triggered. It may take a few minutes to roll out." 