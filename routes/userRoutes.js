import express from 'express';
import { getMe, searchUsers, getUserByUsername } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, getMe);
router.get('/search', searchUsers); // Public endpoint for navbar search
router.get('/:username', getUserByUsername);

export default router;

