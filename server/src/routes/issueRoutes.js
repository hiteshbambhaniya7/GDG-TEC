import express from 'express';
import {
  createIssue,
  getIssues,
  getIssueByTrackingId,
  getIssueById,
  updateIssueStatus,
  assignOfficer,
  resolveIssue,
  addCitizenFeedback,
  getPublicFeed
} from '../controllers/issueController.js';
import { upload } from '../middleware/upload.js';
import { optionalAuth, protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, upload.single('image'), createIssue);
router.get('/', getIssues);
router.get('/public/feed', getPublicFeed);
router.get('/track/:trackingId', getIssueByTrackingId);
router.get('/:id', getIssueById);

// Status transition & Assignment
router.patch('/:id/status', optionalAuth, updateIssueStatus);
router.patch('/:id/assign', optionalAuth, assignOfficer);

// Resolution proof upload (photo + closing notes)
router.post('/:id/resolve', optionalAuth, upload.single('proofImage'), resolveIssue);

// Citizen Feedback
router.post('/:id/feedback', addCitizenFeedback);

export default router;
