const express = require('express');
const router = express.Router();
const { getWithAuth, postWithAuth, updateWithAuth, deleteWithAuth } = require('../utils/api.helpers');

// Get patients list
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.query;

    console.log(`[DOCTOR PATIENTS] Fetching patients list, page=${page}, page_size=${page_size}`);
    console.log(`[DOCTOR PATIENTS] Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

    const response = await getWithAuth(`/patients/get-patients?page=${page}&page_size=${page_size}`, req, res);

    if (!response.success) {
      console.error('[DOCTOR PATIENTS] Upstream error details:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'STAFF_NOT_FOUND' : 'PATIENTS_FETCH_FAILED'
      });
    }

    console.log(`[DOCTOR PATIENTS] Successfully fetched patients data`);
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR PATIENTS] Endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Add new patient
router.post('/patients', async (req, res) => {
  try {
    const patientData = req.body;

    console.log(`[DOCTOR PATIENTS] Adding new patient: ${patientData.first_name} ${patientData.last_name}`);

    const response = await postWithAuth('/patients/add-patient', patientData, req, res);

    if (!response.success) {
      console.error('[DOCTOR PATIENTS] Add patient error:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 409 ? 'PATIENT_EXISTS' : 'ADD_PATIENT_FAILED'
      });
    }

    console.log(`[DOCTOR PATIENTS] Successfully added patient`);
    return res.status(201).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR PATIENTS] Add patient endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Edit patient
router.patch('/patients/:patientUuid', async (req, res) => {
  try {
    const { patientUuid } = req.params;
    const patientData = req.body;

    console.log(`[DOCTOR PATIENTS] Editing patient: ${patientUuid}`);

    const response = await updateWithAuth(`/patients/edit-patient/${patientUuid}`, patientData, req, res);

    if (!response.success) {
      console.error('[DOCTOR PATIENTS] Edit patient error:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'PATIENT_NOT_FOUND' : 'EDIT_PATIENT_FAILED'
      });
    }

    console.log(`[DOCTOR PATIENTS] Successfully edited patient`);
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR PATIENTS] Edit patient endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Delete patient
router.delete('/patients/:patientUuid', async (req, res) => {
  try {
    const { patientUuid } = req.params;

    console.log(`[DOCTOR PATIENTS] Deleting patient: ${patientUuid}`);

    const response = await deleteWithAuth(`/patients/delete-patient/${patientUuid}`, req, res);

    if (!response.success) {
      console.error('[DOCTOR PATIENTS] Delete patient error:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 404 ? 'PATIENT_NOT_FOUND' : 'DELETE_PATIENT_FAILED'
      });
    }

    console.log(`[DOCTOR PATIENTS] Successfully deleted patient`);
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('[DOCTOR PATIENTS] Delete patient endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
