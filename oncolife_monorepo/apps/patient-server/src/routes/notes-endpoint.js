const express = require('express');
const router = express.Router();
const { getWithAuth, postWithAuth, updateWithAuth } = require('../utils/api.helpers');

router.get('/notes/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const response = await getWithAuth(`/diary/${year}/${month}`, req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

router.post('/notes', async (req, res) => {
    try {
        const response = await postWithAuth(`/diary`, req.body, req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

router.patch('/notes/:noteId', async (req, res) => {
    try {
        const response = await updateWithAuth(`/diary/${req.params.noteId}`, req.body, req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

router.patch('/notes/:noteId/delete', async (req, res) => {
    try {
        const response = await updateWithAuth(`/diary/${req.params.noteId}/delete`, {}, req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

module.exports = router;
