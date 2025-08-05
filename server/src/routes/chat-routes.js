const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');

router.get('/session/today', async (req, res) => {
  try {
    const data = await api.get('/chat/session/today', {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Chat session error:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch chat session',
      details: error.message
    });
  }
});

router.post('/message', async (req, res) => {
  try {
    const data = await api.post('/chat/message', req.body, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to send message',
      details: error.message
    });
  }
});

router.post('/session/new', async (req, res) => {
  try {
    const response = await api.post('/chat/session/new', req.body, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('New session error:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create new session',
      details: error.message
    });
  }
});

// New route for chemo date logging
router.post('/chemo/log', async (req, res) => {
  try {
    const data = await api.post('/chemo/log', req.body, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Log chemo date error:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to log chemotherapy date',
      details: error.message
    });
  }
});

module.exports = router; 