const express = require('express');
const router = express.Router();
const { updateWithAuth } = require('../utils/api.helpers');

// Update patient consent and acknowledgement flags
router.patch('/patient/update-consent', async (req, res) => {
  try {
    const response = await updateWithAuth('/patient/update-consent', req.body, req, res);
    if (!response.success) {
      return res.status(response.status).json({ success: false, message: response.error.message, error: 'BACKEND_ERROR', details: response.error.details });
    }
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error forwarding update-consent:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 