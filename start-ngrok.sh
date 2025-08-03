#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Patient Portal with ngrok tunnels...${NC}"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed. Please install it first:${NC}"
    echo "Visit: https://ngrok.com/download"
    exit 1
fi

# Check if ngrok auth token is set
if [ -z "$NGROK_AUTHTOKEN" ]; then
    echo -e "${YELLOW}⚠️  NGROK_AUTHTOKEN not set. Please set it:${NC}"
    echo "export NGROK_AUTHTOKEN=your_auth_token_here"
    echo "Or add it to your ~/.bashrc or ~/.zshrc"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Backend (FastAPI)
echo -e "${GREEN}📡 Starting Backend (FastAPI) on port 8000...${NC}"
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Frontend Server (Express)
echo -e "${GREEN}🌐 Starting Frontend Server (Express) on port 3000...${NC}"
cd frontend/server
npm run dev &
FRONTEND_SERVER_PID=$!
cd ../..

# Wait a moment for frontend server to start
sleep 3

# Start Frontend UI (Vite)
echo -e "${GREEN}🎨 Starting Frontend UI (Vite) on port 5173...${NC}"
cd frontend/ui
npm run dev &
FRONTEND_UI_PID=$!
cd ../..

# Wait for all services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 5

# Start ngrok tunnels
echo -e "${GREEN}🔗 Starting ngrok tunnels...${NC}"

# Start ngrok for backend API
echo -e "${BLUE}📡 Starting ngrok tunnel for Backend API...${NC}"
ngrok http 8000 --subdomain=patient-portal-api &
BACKEND_TUNNEL_PID=$!

# Start ngrok for frontend server
echo -e "${BLUE}🌐 Starting ngrok tunnel for Frontend Server...${NC}"
ngrok http 3000 --subdomain=patient-portal-server &
FRONTEND_SERVER_TUNNEL_PID=$!

# Start ngrok for frontend UI
echo -e "${BLUE}🎨 Starting ngrok tunnel for Frontend UI...${NC}"
ngrok http 5173 --subdomain=patient-portal-ui &
FRONTEND_UI_TUNNEL_PID=$!

# Wait for ngrok tunnels to start
sleep 3

echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${BLUE}📋 Service URLs:${NC}"
echo -e "  Backend API: https://patient-portal-api.ngrok.io"
echo -e "  Frontend Server: https://patient-portal-server.ngrok.io"
echo -e "  Frontend UI: https://patient-portal-ui.ngrok.io"
echo -e ""
echo -e "${YELLOW}💡 To access your app, use: https://patient-portal-ui.ngrok.io${NC}"
echo -e "${YELLOW}🔧 To stop all services, press Ctrl+C${NC}"

# Keep script running
wait 