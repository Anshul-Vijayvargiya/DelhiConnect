const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, requireRole, optionalAuth } = require('../middleware/auth');
const {
  createComplaint, getComplaints, getComplaintById, getComplaintByGrievanceId,
  updateStatus, assignComplaint, resolveComplaint, submitFeedback,
  toggleVote, addComment
} = require('../controllers/complaintsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', optionalAuth, upload.any(), createComplaint);
router.get('/', protect, getComplaints);
router.get('/track/:grievanceId', getComplaintByGrievanceId);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, requireRole('officer', 'admin'), updateStatus);
router.patch('/:id/assign', protect, requireRole('admin'), assignComplaint);
router.post('/:id/resolve', protect, requireRole('officer', 'admin'), upload.any(), resolveComplaint);
router.post('/:id/feedback', protect, submitFeedback);
router.post('/:id/vote', protect, toggleVote);
router.post('/:id/comment', protect, addComment);

module.exports = router;
