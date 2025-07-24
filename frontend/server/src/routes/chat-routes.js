const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');

router.get('/session/today', async (req, res) => {
  try {
    const data = await api.get('/chat/session/today', {
      headers: { 'Authorization': req.headers.authorization }
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
      headers: { 'Authorization': req.headers.authorization }
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

module.exports = router; 