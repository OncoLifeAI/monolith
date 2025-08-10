#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load env if present for registry discovery
if [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/deploy.env"
fi

function confirm() {
  local prompt="$1"
  read -r -p "$prompt [y/N]: " reply || true
  case "${reply:-}" in
    [yY][eE][sS]|[yY]) echo "yes";;
    *) echo "no";;
  esac
}

function derive_registry_host() {
  if [[ -n "${ECR_REGISTRY_HOST:-}" ]]; then
    echo "$ECR_REGISTRY_HOST"
    return
  fi
  # Try to parse from FRONTEND_ECR_REPO or BACKEND_ECR_REPO
  local repo="${FRONTEND_ECR_REPO:-${BACKEND_ECR_REPO:-}}"
  if [[ -n "$repo" ]]; then
    echo "$repo" | awk -F'/' '{print $1}'
    return
  fi
  # Fallback: ask user
  read -r -p "Enter ECR registry host (e.g. 296062592436.dkr.ecr.us-west-1.amazonaws.com): " host
  echo "$host"
}

function ecr_login() {
  local registry
  registry="$(derive_registry_host)"
  if [[ -z "$registry" ]]; then
    echo "No registry provided. Skipping login." >&2
    return
  fi
  echo "Logging into ECR: $registry"
  aws ecr get-login-password | docker login --username AWS --password-stdin "$registry"
}

function redeploy_backend() {
  echo "Redeploy Backend (patient-api)"
  if [[ "$(confirm 'Proceed to build, push, and redeploy backend?')" == "yes" ]]; then
    bash "$SCRIPT_DIR/redeploy-backend.sh"
  else
    echo "Cancelled backend redeploy."
  fi
}

function redeploy_frontend() {
  echo "Redeploy Frontend/Gateway (patient-gateway)"
  if [[ "$(confirm 'Proceed to build, push, and redeploy frontend/gateway?')" == "yes" ]]; then
    bash "$SCRIPT_DIR/redeploy-frontend.sh"
  else
    echo "Cancelled frontend/gateway redeploy."
  fi
}

function main_menu() {
  echo "Select action:"
  echo "  1) Authenticate to ECR"
  echo "  2) Redeploy Frontend/Gateway"
  echo "  3) Redeploy Backend"
  echo "  4) Redeploy Both (Backend then Frontend)"
  echo "  0) Exit"
  read -r -p "Enter choice: " choice
  case "$choice" in
    1)
      if [[ "$(confirm 'Run ECR login now?')" == "yes" ]]; then
        ecr_login
      else
        echo "Skipped authentication."
      fi
      ;;
    2)
      redeploy_frontend
      ;;
    3)
      redeploy_backend
      ;;
    4)
      redeploy_backend
      redeploy_frontend
      ;;
    0)
      echo "Bye"; exit 0;;
    *)
      echo "Invalid choice"; exit 1;;
  esac
}

main_menu 