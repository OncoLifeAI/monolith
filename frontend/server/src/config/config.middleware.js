const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Main configuration function
function configureMiddleware(app) {
  app.use(helmet());

  app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(express.static(path.join(__dirname, '../../public')));

  // Proxy WebSocket connections to FastAPI backend
  app.use('/chat/ws', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    ws: true, // Enable WebSocket proxy
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying WebSocket: ${req.method} ${req.url} to backend`);
    },
    onError: (err, req, res) => {
      console.error('WebSocket proxy error:', err);
    }
  }));

  // Proxy frontend requests to Vite dev server (ONLY for non-API routes)
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'  // Don't rewrite API calls
    },
    onProxyReq: (proxyReq, req, res) => {
      // Only proxy non-API requests to Vite
      if (!req.url.startsWith('/api') && !req.url.startsWith('/chat/ws')) {
        console.log(`Proxying frontend request: ${req.method} ${req.url} to Vite`);
      }
    },
    // Skip proxying for API routes
    filter: (req, res) => {
      return !req.url.startsWith('/api') && !req.url.startsWith('/chat/ws');
    }
  }));
}

module.exports = configureMiddleware;