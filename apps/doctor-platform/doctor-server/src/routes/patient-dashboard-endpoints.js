const express = require('express');
const router = express.Router();
const { getWithAuth } = require('../utils/api.helpers');

// GET /api/patient-dashboard/:patient_uuid/conversations?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get('/patient-dashboard/:patient_uuid/conversations', async (req, res) => {
  try {
    const { patient_uuid } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date and end_date are required',
        error: 'MISSING_DATES'
      });
    }

    const upstreamPath = `/patient-dashboard/${patient_uuid}/conversations?start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
    const response = await getWithAuth(upstreamPath, req, res);

    if (!response.success) {
      return res.status(response.status).json({
        success: false,
        message: response.error?.message || 'Failed to fetch conversations',
        error: 'PATIENT_DASHBOARD_FETCH_FAILED'
      });
    }

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('[PATIENT DASHBOARD] Endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;


