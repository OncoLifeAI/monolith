const express = require('express');
const router = express.Router();
const { getWithAuth, postWithAuth, updateWithAuth } = require('../utils/api.helpers');
const { apiClient } = require('../config/axios.config');

router.get('/notes/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const base = apiClient.defaults.baseURL;
        console.log(`[NOTES] GET ${base}/diary/${year}/${month}`);
        const response = await getWithAuth(`/diary/${year}/${month}`, req, res);
        return res.status(200).json(response);
    } catch (error) {
        console.error('[NOTES] List failed:', error.message);
        return res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

router.post('/notes', async (req, res) => {
    try {
        const base = apiClient.defaults.baseURL;
        console.log(`[NOTES] POST ${base}/diary`);
        const response = await postWithAuth(`/diary`, req.body, req, res);
        return res.status(200).json(response);
    } catch (error) {
        console.error('[NOTES] Create failed:', error.message);
        return res.status(500).json({ error: 'Failed to create note' });
    }
});

router.patch('/notes/:noteId', async (req, res) => {
    try {
        const base = apiClient.defaults.baseURL;
        console.log(`[NOTES] PATCH ${base}/diary/${req.params.noteId}`);
        const response = await updateWithAuth(`/diary/${req.params.noteId}`, req.body, req, res);
        return res.status(200).json(response);
    } catch (error) {
        console.error('[NOTES] Update failed:', error.message);
        return res.status(500).json({ error: 'Failed to update note' });
    }
});

router.delete('/notes/:noteId', async (req, res) => {
    try {
        const base = apiClient.defaults.baseURL;
        console.log(`[NOTES] DELETE ${base}/diary/${req.params.noteId}`);
        const response = await apiClient.delete(`/diary/${req.params.noteId}`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        return res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('[NOTES] Delete failed:', error.message);
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Note not found' });
        }
        return res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;
