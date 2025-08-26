const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');

router.get('/dashboard', async (req, res) => {
  try {
    const { staff_uuid, page = 1, page_size = 20 } = req.query;

    if (!staff_uuid) {
      console.warn('[DOCTOR DASHBOARD] Missing staff_uuid parameter');
      return res.status(400).json({
        success: false,
        message: 'staff_uuid parameter is required',
        error: 'MISSING_STAFF_UUID'
      });
    }

    console.log(`[DOCTOR DASHBOARD] Fetching dashboard info for staff_uuid=${staff_uuid}, page=${page}, page_size=${page_size}`);

    const response = await api.get(`/dashboard/get-dashboard-info?staff_uuid=${staff_uuid}&page=${page}&page_size=${page_size}`);

    if (!response.success) {
      console.error('[DOCTOR DASHBOARD] Upstream error details:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'STAFF_NOT_FOUND' : 'DASHBOARD_FETCH_FAILED'
      });
    }

    console.log(`[DOCTOR DASHBOARD] Successfully fetched dashboard data for staff_uuid=${staff_uuid}`);
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR DASHBOARD] Endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;


