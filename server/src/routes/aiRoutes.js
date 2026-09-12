import express from 'express';
import { testAnalyze, reanalyzeIssue } from '../controllers/aiController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/analyze', upload.single('image'), testAnalyze);
router.post('/reanalyze/:id', reanalyzeIssue);

export default router;
