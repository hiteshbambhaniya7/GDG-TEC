import express from 'express';
import { register, login, getMe, getOfficers, getUsers } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/officers', getOfficers);
router.get('/users', getUsers);

export const usersRouter = express.Router();
usersRouter.get('/', getUsers);
usersRouter.get('/officers', getOfficers);

export default router;
