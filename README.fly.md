# Fly.io Deployment (Patient Platform)

## Prerequisites
- Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
- Run `fly auth login`

## Backend API (FastAPI)
```
cd apps/patient-platform/patient-api
fly launch --no-deploy   # if first time; accepts defaults/app name
fly deploy --remote-only --now
```

The service listens on internal port 8000. Public HTTPS is exposed on 443.

## Frontend Gateway (Express + static web)
```
cd apps/patient-platform/patient-server
# fly.toml points BACKEND_URL and API_BASE to the backend via private DNS
fly launch --no-deploy   # if first time; accepts defaults/app name
fly deploy --remote-only --now
```

This serves static web and proxies `/api` and `/api/chat/ws` to the backend.

## Private Networking
- In `apps/patient-platform/patient-server/fly.toml` the backend URL is set to `http://oncolife-patient-api.internal:8000` which resolves over Fly’s private network. Ensure the backend app name matches the one you deployed (or update the hostname accordingly).

## Environment Variables
- Frontend/gateway: `BACKEND_URL` and `API_BASE` are set in `fly.toml`. Adjust if you change the backend app name or port.
- Backend: set your Cognito envs (`AWS_REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`) via `fly secrets set KEY=VALUE` if needed.

## Redeploy scripts
- `infrastructure/scripts/redeploy-frontend.sh`
- `infrastructure/scripts/redeploy-backend.sh`

These call `fly deploy` from the correct directories. 