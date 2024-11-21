import express from 'express';
import {createPostController, getPostController, getPostsController} from '../controllers/postsController.js';

const router = express.Router();

// 라우터 연결
router.get('/', getPostsController);
router.get('/:postId',getPostController);
router.post('/', createPostController);

export default router;