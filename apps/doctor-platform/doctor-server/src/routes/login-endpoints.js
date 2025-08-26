const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');
const { apiClient } = require('../config/axios.config');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('[DOCTOR LOGIN] Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    const backendBase = apiClient?.defaults?.baseURL || '<unknown>';
    console.log(`[DOCTOR LOGIN] Incoming login for ${email} -> POST ${backendBase}/auth/login`);

    const response = await api.post('/auth/login', {
      email,
      password
    });

    console.log(`[DOCTOR LOGIN] Upstream response for ${email}: success=${response.success} status=${response.status}`);

    if (!response.success) {
      console.error('[DOCTOR LOGIN] Upstream error details:', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 401 ? 'INVALID_CREDENTIALS' : 'AUTHENTICATION_FAILED'
      });
    }

    const { valid, message, user_status, session, tokens } = response.data;

    if (valid) {
      if (user_status === 'CONFIRMED') {
        console.log(`[DOCTOR LOGIN] Successful login for ${email}`);
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: { user_status, message, tokens }
        });
      } else if (user_status === 'FORCE_CHANGE_PASSWORD') {
        console.log(`[DOCTOR LOGIN] Password change required for ${email}`);
        return res.status(200).json({
          success: true,
          message: 'Password change required',
          data: { user_status, message, session, requiresPasswordChange: true }
        });
      } else if (user_status === 'CHALLENGE_REQUIRED') {
        console.log(`[DOCTOR LOGIN] Challenge required for ${email}`);
        return res.status(200).json({
          success: true,
          message: 'Additional authentication required',
          data: { user_status, message, session, requiresChallenge: true }
        });
      }
    } else {
      console.warn(`[DOCTOR LOGIN] Invalid credentials for ${email}`);
      return res.status(401).json({
        success: false,
        message: message || 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

  } catch (error) {
    const backendBase = apiClient?.defaults?.baseURL || '<unknown>';
    console.error(`[DOCTOR LOGIN] Endpoint error (backend=${backendBase}):`, error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

router.post('/complete-new-password', async (req, res) => {
  try {
    const { email, new_password, session } = req.body;

    if (!email || !new_password || !session) {
      console.warn('[DOCTOR LOGIN] Missing fields for complete-new-password');
      return res.status(400).json({
        success: false,
        message: 'Email, new password, and session are required',
        error: 'MISSING_FIELDS'
      });
    }

    const backendBase = apiClient?.defaults?.baseURL || '<unknown>';
    console.log(`[DOCTOR LOGIN] complete-new-password for ${email} -> POST ${backendBase}/auth/complete-new-password`);

    const response = await api.post('/auth/complete-new-password', {
      email,
      new_password,
      session
    });

    if (!response.success) {
      console.error('[DOCTOR LOGIN] Upstream error details (complete-new-password):', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 400 ? 'INVALID_REQUEST' : 'PASSWORD_CHANGE_FAILED'
      });
    }

    const { message, tokens } = response.data;

    console.log(`[DOCTOR LOGIN] complete-new-password success for ${email}`);
    return res.status(200).json({ success: true, message: 'Password changed successfully', data: { message, tokens } });
  } catch (error) {
    console.error('[DOCTOR LOGIN] complete-new-password endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { emailAddress:email, firstName:first_name, lastName:last_name } = req.body;

    if (!email || !first_name || !last_name) {
      console.warn('[DOCTOR LOGIN] Missing fields for signup');
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and last name are required',
        error: 'MISSING_FIELDS'
      });
    }

    const backendBase = apiClient?.defaults?.baseURL || '<unknown>';
    console.log(`[DOCTOR LOGIN] signup for ${email} -> POST ${backendBase}/auth/doctor/signup`);
    
    const response = await api.post('/auth/doctor/signup', { 
      email, 
      first_name, 
      last_name,
      role: 'admin' // Default role for doctor signups
    });

    if (!response.success) {
      console.error('[DOCTOR LOGIN] Upstream error details (signup):', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 400 ? 'BAD_REQUEST' : 'SIGNUP_FAILED'
      });
    }

    const { message, email: userEmail, user_status, staff_uuid } = response.data;

    console.log(`[DOCTOR LOGIN] signup success for ${email} staff_uuid=${staff_uuid}`);
    return res.status(201).json({ success: true, message: 'User created successfully', data: { message, email: userEmail, user_status, staff_uuid } });
  } catch (error) {
    console.error('Doctor signup endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      console.warn('[DOCTOR LOGIN] Missing email for forgot-password');
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: 'MISSING_EMAIL'
      });
    }

    const backendBase = apiClient?.defaults?.baseURL || '<unknown>';
    console.log(`[DOCTOR LOGIN] forgot-password for ${email} -> POST ${backendBase}/auth/forgot-password`);

    const response = await api.post('/auth/forgot-password', { email });
    
    if (!response.success) {
      console.error('[DOCTOR LOGIN] Upstream error details (forgot-password):', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: 'FORGOT_PASSWORD_FAILED'
      });
    }

    const { message, email: userEmail } = response.data;

    console.log(`[DOCTOR LOGIN] forgot-password success for ${email}`);
    return res.status(200).json({
      success: true,
      message: message || 'Password reset code sent successfully',
      data: { email: userEmail }
    });

  } catch (error) {
    console.error('[DOCTOR LOGIN] forgot-password endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, confirmation_code, new_password } = req.body;

    if (!email || !confirmation_code || !new_password) {
      console.warn('[DOCTOR LOGIN] Missing fields for reset-password');
      return res.status(400).json({
        success: false,
        message: 'Email, confirmation code, and new password are required',
        error: 'MISSING_FIELDS'
      });
    }

    if (confirmation_code.length !== 6) {
      console.warn('[DOCTOR LOGIN] Invalid confirmation code length for reset-password');
      return res.status(400).json({
        success: false,
        message: 'Confirmation code must be 6 digits',
        error: 'INVALID_CODE_FORMAT'
      });
    }

    const backendBase = apiClient?.defaults?.baseURL || '<unknown>';
    console.log(`[DOCTOR LOGIN] reset-password for ${email} -> POST ${backendBase}/auth/reset-password`);

    const response = await api.post('/auth/reset-password', { 
      email, 
      confirmation_code, 
      new_password 
    });
    
    if (!response.success) {
      console.error('[DOCTOR LOGIN] Upstream error details (reset-password):', response.error?.details || response.error?.message);
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: 'RESET_PASSWORD_FAILED'
      });
    }

    const { message, email: userEmail } = response.data;

    console.log(`[DOCTOR LOGIN] reset-password success for ${email}`);
    return res.status(200).json({
      success: true,
      message: message || 'Password reset successfully',
      data: { email: userEmail }
    });

  } catch (error) {
    console.error('[DOCTOR LOGIN] reset-password endpoint error:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
