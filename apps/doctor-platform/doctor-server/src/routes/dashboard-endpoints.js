const express = require('express');
const router = express.Router();
const { getWithAuth } = require('../utils/api.helpers');

router.get('/dashboard', async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.query;

    console.log(`[DOCTOR DASHBOARD] Fetching dashboard info for authenticated user, page=${page}, page_size=${page_size}`);
    console.log(`[DOCTOR DASHBOARD] Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
    if (req.headers.authorization) {
      console.log(`[DOCTOR DASHBOARD] Token preview: ${req.headers.authorization.substring(0, 20)}...`);
    }

    const response = await getWithAuth(`/dashboard/get-dashboard-info?page=${page}&page_size=${page_size}`, req, res);

    if (!response.success) {
      console.error('[DOCTOR DASHBOARD] Upstream error details:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'STAFF_NOT_FOUND' : 'DASHBOARD_FETCH_FAILED'
      });
    }

    console.log(`[DOCTOR DASHBOARD] Successfully fetched dashboard data for authenticated user`);
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


