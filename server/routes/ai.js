const express = require('express');
const router = express.Router();
const { categorizeComplaint } = require('../services/geminiService');

// POST /api/ai/categorize
router.post('/categorize', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text is required' });
  const result = await categorizeComplaint(text);
  res.json(result);
});

module.exports = router;
