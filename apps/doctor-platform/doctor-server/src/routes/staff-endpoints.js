const express = require('express');
const router = express.Router();
const { getWithAuth, postWithAuth, updateWithAuth, deleteWithAuth } = require('../utils/api.helpers');

// Get staff list
router.get('/staff', async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.query;

    console.log(`[DOCTOR STAFF] Fetching staff list, page=${page}, page_size=${page_size}`);
    console.log(`[DOCTOR STAFF] Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

    const response = await getWithAuth(`/staff/get-staff?page=${page}&page_size=${page_size}`, req, res);

    if (!response.success) {
      console.error('[DOCTOR STAFF] Upstream error details:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'STAFF_NOT_FOUND' : 'STAFF_FETCH_FAILED'
      });
    }

    console.log(`[DOCTOR STAFF] Successfully fetched staff data`);
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR STAFF] Endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Add new staff
router.post('/staff', async (req, res) => {
  try {
    const staffData = req.body;

    console.log(`[DOCTOR STAFF] Adding new staff: ${staffData.first_name} ${staffData.last_name}`);

    const response = await postWithAuth('/staff/add-staff', staffData, req, res);

    if (!response.success) {
      console.error('[DOCTOR STAFF] Add staff error:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 409 ? 'STAFF_EXISTS' : 'ADD_STAFF_FAILED'
      });
    }

    console.log(`[DOCTOR STAFF] Successfully added staff`);
    return res.status(201).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR STAFF] Add staff endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Edit staff
router.patch('/staff/:staffUuid', async (req, res) => {
  try {
    const { staffUuid } = req.params;
    const staffData = req.body;

    console.log(`[DOCTOR STAFF] Editing staff: ${staffUuid}`);

    const response = await updateWithAuth(`/staff/edit-staff/${staffUuid}`, staffData, req, res);

    if (!response.success) {
      console.error('[DOCTOR STAFF] Edit staff error:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'STAFF_NOT_FOUND' : 'EDIT_STAFF_FAILED'
      });
    }

    console.log(`[DOCTOR STAFF] Successfully edited staff`);
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR STAFF] Edit staff endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
