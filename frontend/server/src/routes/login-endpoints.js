const express = require('express');
const router = express.Router();
const { api } = require('../utils/api.helpers');


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (!response.success) {
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 401 ? 'INVALID_CREDENTIALS' : 'AUTHENTICATION_FAILED'
      });
    }

    const { valid, message, user_status, session } = response.data;

    if (valid) {
      if (user_status === 'CONFIRMED') {
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user_status,
            message
          }
        });
      } else if (user_status === 'FORCE_CHANGE_PASSWORD') {
        return res.status(200).json({
          success: true,
          message: 'Password change required',
          data: {
            user_status,
            message,
            session,
            requiresPasswordChange: true
          }
        });
      } else if (user_status === 'CHALLENGE_REQUIRED') {
        return res.status(200).json({
          success: true,
          message: 'Additional authentication required',
          data: {
            user_status,
            message,
            session,
            requiresChallenge: true
          }
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: message || 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

  } catch (error) {
    console.error('Login endpoint error:', error);
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
      return res.status(400).json({
        success: false,
        message: 'Email, new password, and session are required',
        error: 'MISSING_FIELDS'
      });
    }

    const response = await api.post('/auth/complete-new-password', {
      email,
      new_password,
      session
    });

    if (!response.success) {
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 400 ? 'INVALID_REQUEST' : 'PASSWORD_CHANGE_FAILED'
      });
    }

    const { message, tokens } = response.data;

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        message,
        tokens
      }
    });

  } catch (error) {
    console.error('Complete new password endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { emailAddress:email, firstName:first_name, lastName:last_name } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and last name are required',
        error: 'MISSING_FIELDS'
      });
    }

    const response = await api.post('/auth/signup', {
      email,
      first_name,
      last_name
    });

    if (!response.success) {
      return res.status(response.status).json({
        success: false,
        message: response.error.message,
        error: response.error.code === 400 ? 'BAD_REQUEST' : 'SIGNUP_FAILED'
      });
    }

    const { message, email: userEmail, user_status } = response.data;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        message,
        email: userEmail,
        user_status
      }
    });

  } catch (error) {
    console.error('Signup endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
