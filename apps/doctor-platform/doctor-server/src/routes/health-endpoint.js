const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');

router.get('/health', async (req, res) => {
  try {
    const response = await api.get('/health');
    
    if (!response.success) {
      return res.status(response.status).json({
        error: 'Doctor API health check failed',
        details: response.error.message
      });
    }
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Doctor API health check error:', error);
    res.status(500).json({ 
      error: 'Doctor API health check failed',
      details: error.message 
    });
  }
});

module.exports = router;
