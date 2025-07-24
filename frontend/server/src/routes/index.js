const express = require('express');
const router = express.Router();

const healthRoutes = require('./health-endpoint');
const loginRoutes = require('./login-endpoints');
const summariesRoutes = require('./summaries-endpoint');
const notesRoutes = require('./notes-endpoint');
const profileRoutes = require('./profile-endpoint');
const chatRoutes = require('./chat-routes');

router.get('/', (req, res) => {
  res.json({
    message: 'Express Server API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


router.use('/api', healthRoutes);
router.use('/api', loginRoutes);
router.use('/api', summariesRoutes);
router.use('/api', notesRoutes);
router.use('/api', profileRoutes);
router.use('/api/chat', chatRoutes);

module.exports = router;