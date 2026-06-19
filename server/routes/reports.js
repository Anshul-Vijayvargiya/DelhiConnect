const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { generateReport } = require('../controllers/reportController');

router.get('/generate', protect, requireRole('admin'), generateReport);

module.exports = router;
