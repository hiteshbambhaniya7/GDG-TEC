import express from 'express';
import { seedDatabase } from '../scripts/seedBhavnagarData.js';

const router = express.Router();

router.post('/seed', async (req, res, next) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Demo dataset for Bhavnagar initialized successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
