import express from 'express';
import {
  uploadImage,
  getFeed,
  getPostsByUsername,
  deletePost,
} from '../controllers/postController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', authenticate, upload.single('image'), uploadImage);
router.get('/feed', getFeed); // Public endpoint for landing page
router.get('/user/:username', getPostsByUsername);
router.delete('/:postId', authenticate, deletePost);

export default router;

