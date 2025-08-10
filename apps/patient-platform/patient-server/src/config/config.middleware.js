const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Main configuration function
function configureMiddleware(app) {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
        "connect-src": ["'self'", "https:", "wss:"],
      }
    }
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Always proxy WebSocket connections to FastAPI backend
  const rawBackendBase = process.env.BACKEND_URL;
  const backendBase = (typeof rawBackendBase === 'string' ? rawBackendBase.trim() : '') || 'http://localhost:8000';

  // Support both '/chat/ws' and '/api/chat/ws' so BASE_URL can be '/api'
  const wsProxy = createProxyMiddleware({
    target: backendBase,
    changeOrigin: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Proxying WebSocket: ${req.method} ${req.url} -> ${backendBase}`);
      }
    },
    onError: (err, req, res) => {
      console.error('WebSocket proxy error:', err);
    }
  });

  app.use('/chat/ws', wsProxy);
  app.use('/api/chat/ws', wsProxy);

  if (process.env.NODE_ENV === 'production') {
    const webDist = path.join(__dirname, '../../../patient-web/dist');
    app.use(express.static(webDist));

    // Single Page App fallback to index.html (excluding API and WS routes)
    app.get('*', (req, res, next) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/chat/ws')) return next();
      return res.sendFile(path.join(webDist, 'index.html'));
    });
    return; // No Vite proxy in production
  }

  // ---- Development mode only: proxy frontend requests to Vite dev server ----
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'  // Don't rewrite API calls
    },
    onProxyReq: (proxyReq, req, res) => {
      // Only proxy non-API routes to Vite
      if (!req.url.startsWith('/api') && !req.url.startsWith('/chat/ws')) {
        console.log(`Proxying frontend request: ${req.method} ${req.url} to Vite`);
      }
    },
    // Skip proxying for API routes and WebSocket
    filter: (req, res) => {
      return !req.url.startsWith('/api') && !req.url.startsWith('/chat/ws');
    }
  }));
}

module.exports = configureMiddleware;