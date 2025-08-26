const express = require('express');
const router = express.Router();

const healthRoutes = require('./health-endpoint');
const loginRoutes = require('./login-endpoints');
const dashboardRoutes = require('./dashboard-endpoints');

router.get('/', (req, res) => {
  res.json({
    message: 'Doctor Platform Express Server API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

router.use('/', healthRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);

module.exports = router;
