# OncoLife Doctor Platform

The OncoLife Doctor Platform is a comprehensive healthcare application that enables doctors and staff members to manage patient care, view patient information, and handle administrative tasks.

## Architecture

The platform consists of three main components:

- **doctor-web** - React frontend application (Vite + TypeScript)
- **doctor-server** - Node.js middleware server (Express.js)
- **doctor-api** - Python FastAPI backend with authentication and database management

## Prerequisites

- Node.js (v18+ recommended)
- Python 3.9+
- npm or yarn package manager
- AWS Cognito configuration
- PostgreSQL database

## Development Setup

To run the complete doctor platform in development mode, you'll need to start all three services in separate terminals from the **monolith root directory**.

### Terminal 1: Frontend (React Web App)

```bash
npm run dev --workspace=@oncolife/doctor-web
```

This starts the React frontend on `http://localhost:5173`

### Terminal 2: Middleware Server (Node.js)

```bash
npm run dev --workspace=@oncolife/doctor-server
```

This starts the Express.js middleware server (typically on port 3000)

### Terminal 3: Backend API (Python FastAPI)

```bash
PYTHONPATH=apps/doctor-platform/doctor-api/src uvicorn main:app --reload --port 8000 --app-dir apps/doctor-platform/doctor-api/src
```

This starts the FastAPI backend on `http://localhost:8000` with proper Python path configuration

## Service Details

### Doctor Web (Frontend)
- **Technology**: React, TypeScript, Vite, Material-UI
- **Port**: 5173 (default Vite dev server)
- **Location**: `apps/doctor-platform/doctor-web/`

### Doctor Server (Middleware)
- **Technology**: Node.js, Express.js
- **Port**: 3000 (configurable)
- **Location**: `apps/doctor-platform/doctor-server/`

### Doctor API (Backend)
- **Technology**: Python, FastAPI, SQLAlchemy, AWS Cognito
- **Port**: 8000
- **Location**: `apps/doctor-platform/doctor-api/`
- **Features**: Staff authentication, profile management, staff associations, clinic management

## Environment Variables

Make sure to configure the necessary environment variables for each service:

### Required Environment Variables
- `COGNITO_USER_POOL_ID` - AWS Cognito User Pool ID
- `COGNITO_CLIENT_ID` - AWS Cognito Client ID
- `COGNITO_CLIENT_SECRET` - AWS Cognito Client Secret
- Database connection strings for doctor database
- CORS origins

### Example .env file
```bash
# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/doctor_db

# CORS
CORS_ORIGINS=http://localhost:5173
```

## Accessing the Application

Once all three services are running:

1. Open your browser to `http://localhost:5173`
2. The frontend will communicate with the middleware server and backend API
3. You can sign up new staff members, manage profiles, and handle administrative tasks

## API Endpoints

### Authentication Routes
- `POST /auth/doctor/signup` - Register new doctor/staff member
- `POST /auth/admin/signup` - Register new admin user
- `POST /auth/doctor/login` - Staff login
- `POST /auth/doctor/complete-new-password` - Complete password setup
- `GET /auth/doctor/profile` - Get staff profile
- `DELETE /auth/remove-staff` - Remove staff member (soft delete)
- `POST /auth/logout` - Logout

## Development Notes

- All services support hot reloading for development
- The Python path configuration ensures proper module imports
- Make sure all three terminals remain active while developing
- Check the console output in each terminal for any errors or status updates
- Staff members are soft-deleted (archived) rather than permanently removed

## Troubleshooting

- **Port conflicts**: If any service fails to start, check if the ports are already in use
- **Python import errors**: Ensure you're using the correct PYTHONPATH when starting the API
- **Module errors**: Run `npm install` in the root directory to ensure all dependencies are installed
- **Python errors**: Ensure you have activated the correct Python virtual environment
- **Cognito errors**: Verify your AWS credentials and Cognito configuration
- **Database errors**: Check your database connection and ensure tables exist with proper schema

## Database Schema

The doctor platform uses these main tables:
- `staff_profiles` - Staff member information
- `staff_associations` - Relationships between staff, physicians, and clinics
- `all_clinics` - Clinic information

All tables support soft deletion using `is_archived` boolean fields.
