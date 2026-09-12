import express from 'express';
import { getAnalyticsOverview } from '../controllers/adminController.js';

const router = express.Router();

router.get('/analytics', getAnalyticsOverview);

export default router;
