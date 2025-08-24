# OncoLife Patient Platform

The OncoLife Patient Platform is a comprehensive healthcare application that enables patients to communicate with an AI-powered chatbot for symptom tracking, medication management, and health monitoring.

## Architecture

The platform consists of three main components:

- **patient-web** - React frontend application (Vite + TypeScript)
- **patient-server** - Node.js middleware server (Express.js)
- **patient-api** - Python FastAPI backend with AI/ML capabilities

## Prerequisites

- Node.js (v18+ recommended)
- Python 3.9+
- npm or yarn package manager

## Development Setup

To run the complete patient platform in development mode, you'll need to start all three services in separate terminals from the **monolith root directory**.

### Terminal 1: Frontend (React Web App)

```bash
npm run dev --workspace=@oncolife/patient-web
```

This starts the React frontend on `http://localhost:5173`

### Terminal 2: Middleware Server (Node.js)

```bash
npm run dev --workspace=@oncolife/patient-server
```

This starts the Express.js middleware server (typically on port 3000)

### Terminal 3: Backend API (Python FastAPI)

```bash
CORS_ORIGINS=http://localhost:5173 uvicorn main:app --reload --port 8000 --app-dir apps/patient-platform/patient-api/src
```

This starts the FastAPI backend on `http://localhost:8000` with CORS enabled for the frontend

## Service Details

### Patient Web (Frontend)
- **Technology**: React, TypeScript, Vite
- **Port**: 5173 (default Vite dev server)
- **Location**: `apps/patient-platform/patient-web/`

### Patient Server (Middleware)
- **Technology**: Node.js, Express.js
- **Port**: 3000 (configurable)
- **Location**: `apps/patient-platform/patient-server/`

### Patient API (Backend)
- **Technology**: Python, FastAPI, SQLAlchemy
- **Port**: 8000
- **Location**: `apps/patient-platform/patient-api/`
- **Features**: AI chatbot, symptom tracking, database management

## Environment Variables

Make sure to configure the necessary environment variables for each service:

- Database connection strings
- AI service API keys
- Authentication tokens
- CORS origins

## Accessing the Application

Once all three services are running:

1. Open your browser to `http://localhost:5173`
2. The frontend will communicate with the middleware server and backend API
3. You can interact with the AI chatbot and track symptoms

## Development Notes

- All services support hot reloading for development
- The CORS configuration allows the frontend to communicate with the backend
- Make sure all three terminals remain active while developing
- Check the console output in each terminal for any errors or status updates

## Troubleshooting

- **Port conflicts**: If any service fails to start, check if the ports are already in use
- **CORS errors**: Ensure the CORS_ORIGINS environment variable matches your frontend URL
- **Module errors**: Run `npm install` in the root directory to ensure all dependencies are installed
- **Python errors**: Ensure you have activated the correct Python virtual environment
