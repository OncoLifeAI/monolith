const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');
const { apiClient } = require('../config/axios.config');

// Expose /api/chemo/log at the gateway root to avoid path prefix issues
router.post('/chemo/log', async (req, res) => {
  try {
    const base = apiClient.defaults.baseURL;
    console.log(`[CHEMO] POST ${base}/chemo/log`);
    const data = await api.post('/chemo/log', req.body, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    if (!data.success) {
      console.error('[CHEMO] Upstream error (chemo/log):', data.error?.details || data.error?.message);
      return res.status(data.status).json({ error: 'Failed to log chemotherapy date', details: data.error });
    }
    return res.status(200).json(data.data || data);
  } catch (error) {
    console.error('Log chemo date error:', error);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to log chemotherapy date',
      details: error.message
    });
  }
});

module.exports = router; 