# 🚀 Patient Portal - ngrok Deployment Guide

This guide will help you deploy your Patient Portal application using ngrok so others can access it via a public URL.

## 📋 Prerequisites

1. **Install ngrok**:
   ```bash
   # Option 1: Download from ngrok.com
   # Visit: https://ngrok.com/download
   
   # Option 2: Install via Homebrew (macOS)
   brew install ngrok
   ```

2. **Get ngrok auth token** (optional but recommended):
   - Sign up at https://ngrok.com
   - Get your auth token from the dashboard
   - Set it as environment variable:
   ```bash
   export NGROK_AUTHTOKEN=your_auth_token_here
   ```

## 🏗️ Application Architecture

Your application consists of 3 services:

| Service | Port | Purpose |
|---------|------|---------|
| **Frontend UI** (Vite) | 5173 | React application |
| **Frontend Server** (Express) | 3000 | API proxy server |
| **Backend** (FastAPI) | 8000 | Main API server |

## 🚀 Quick Start (Recommended)

### Option 1: Simple Setup (Free ngrok account)

```bash
# Make the script executable
chmod +x start-ngrok-simple.sh

# Run the deployment script
./start-ngrok-simple.sh
```

This will:
- ✅ Start all 3 services
- ✅ Create ngrok tunnel for the frontend UI
- ✅ Show you the public URL
- ✅ Open ngrok dashboard at http://localhost:4040

### Option 2: Advanced Setup (Paid ngrok account with custom subdomains)

```bash
# 1. Set your ngrok auth token
export NGROK_AUTHTOKEN=your_auth_token_here

# 2. Make the script executable
chmod +x start-ngrok.sh

# 3. Run the deployment script
./start-ngrok.sh
```

This will create custom subdomains:
- `https://patient-portal-ui.ngrok.io` (Frontend UI)
- `https://patient-portal-server.ngrok.io` (Frontend Server)
- `https://patient-portal-api.ngrok.io` (Backend API)

## 🔧 Manual Setup

If you prefer to run services manually:

### 1. Start Backend
```bash
cd backend
python3 main.py
```

### 2. Start Frontend Server
```bash
cd frontend/server
npm run dev
```

### 3. Start Frontend UI
```bash
cd frontend/ui
npm run dev
```

### 4. Create ngrok tunnel
```bash
# For the main frontend UI
ngrok http 5173

# Or for all services (in separate terminals)
ngrok http 8000  # Backend
ngrok http 3000  # Frontend Server
ngrok http 5173  # Frontend UI
```

## 🌐 Accessing Your Application

### For Users
- **Main URL**: Use the ngrok URL shown in the terminal
- **Example**: `https://abc123.ngrok.io`

### For Development
- **Local URLs**:
  - Frontend UI: `http://localhost:5173`
  - Frontend Server: `http://localhost:3000`
  - Backend API: `http://localhost:8000`

## 🔍 Monitoring

### ngrok Dashboard
- Visit: `http://localhost:4040`
- Shows all active tunnels
- Displays request logs
- Provides real-time traffic monitoring

### Service Health Checks
- Backend: `http://localhost:8000/health`
- Frontend Server: `http://localhost:3000/health` (if implemented)

## ⚠️ Important Notes

### CORS Configuration
Your backend already has CORS configured to allow all origins (`"*"`), which is fine for development but should be restricted for production.

### Security Considerations
1. **ngrok URLs are public** - anyone with the URL can access your app
2. **Free ngrok accounts** have limitations:
   - Random URLs each time you restart
   - Limited concurrent connections
   - No custom subdomains

### Troubleshooting

#### Service Won't Start
```bash
# Check if ports are in use
lsof -i :5173
lsof -i :3000
lsof -i :8000

# Kill processes if needed
kill -9 <PID>
```

#### ngrok Connection Issues
```bash
# Check ngrok status
ngrok status

# Restart ngrok
pkill ngrok
ngrok http 5173
```

#### Frontend Can't Connect to Backend
- Ensure backend is running on port 8000
- Check CORS configuration
- Verify API endpoints are correct

## 🎯 Sharing Your Application

### For Demo/Testing
1. Run the deployment script
2. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Share the URL with others

### For Production
Consider using:
- **Vercel** for frontend hosting
- **Railway** or **Heroku** for backend hosting
- **Custom domain** with SSL certificates

## 📱 Mobile Testing

ngrok URLs work great for mobile testing:
- Share the ngrok URL with your phone
- Test responsive design
- Debug mobile-specific issues

## 🔄 Updating Your Application

When you make changes:
1. The services will auto-reload (thanks to `reload=True` in FastAPI and `nodemon` in Express)
2. ngrok tunnels remain active
3. Users will see updates immediately

## 🛑 Stopping Services

Press `Ctrl+C` in the terminal running the deployment script, or:

```bash
# Kill all related processes
pkill -f "python3 main.py"
pkill -f "npm run dev"
pkill ngrok
```

---

**Happy Deploying! 🚀** 