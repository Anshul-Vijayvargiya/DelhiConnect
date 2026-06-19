const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getOverview, getHeatmap, getDepartmentStats, getTrends, getCategoryBreakdown, getDistrictStats } = require('../controllers/analyticsController');

router.get('/overview', protect, getOverview);
router.get('/heatmap', getHeatmap);
router.get('/department', protect, requireRole('admin'), getDepartmentStats);
router.get('/trends', protect, getTrends);
router.get('/categories', protect, getCategoryBreakdown);
router.get('/districts', protect, getDistrictStats);

module.exports = router;
