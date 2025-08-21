const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Main configuration function
function configureMiddleware(app) {
  const connectSrc = process.env.NODE_ENV === 'production'
    ? ["'self'", 'https:']
    : ["'self'", 'http:', 'https:'];

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        "connect-src": connectSrc,
      }
    }
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3001', 'http://localhost:5174'],
    credentials: true
  }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (process.env.NODE_ENV === 'production') {
    const webDist = path.join(__dirname, '../../../doctor-web/dist');
    app.use(express.static(webDist));

    // Single Page App fallback to index.html (excluding API routes)
    app.get('*', (req, res, next) => {
      if (req.url.startsWith('/api')) return next();
      return res.sendFile(path.join(webDist, 'index.html'));
    });
    return; // No Vite proxy in production
  }

  // ---- Development mode only: proxy frontend requests to Vite dev server ----
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5174',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'  // Don't rewrite API calls
    },
    onProxyReq: (proxyReq, req, res) => {
      // Only proxy non-API routes to Vite
      if (!req.url.startsWith('/api')) {
        console.log(`Proxying doctor frontend request: ${req.method} ${req.url} to Vite`);
      }
    },
    // Skip proxying for API routes
    filter: (req, res) => {
      return !req.url.startsWith('/api');
    }
  }));
}

module.exports = configureMiddleware;
