const express = require('express');
const router = express.Router();
const { getWithAuth } = require('../utils/api.helpers');

router.get('/summaries/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const response = await getWithAuth(`/summaries/${year}/${month}`, req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summaries' });
    }
});

router.get('/summaries/:summaryId', async (req, res) => {
    try {
        const { summaryId } = req.params;
        const response = await getWithAuth(`/summaries/${summaryId}`, req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary details' });
    }
});

module.exports = router;