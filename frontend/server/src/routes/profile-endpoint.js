const express = require('express');
const router = express.Router();
const { getWithAuth } = require('../utils/api.helpers');

router.get('/profile', async (req, res) => {
  try {
    const response = await getWithAuth('/profile', req, res);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(response.status).json({ error: response.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
