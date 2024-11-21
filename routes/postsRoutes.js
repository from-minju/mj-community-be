import express from 'express';
import {getPostsController, getPostController, createPostController, editPostController } from '../controllers/postsController.js';

const router = express.Router();

// 라우터 연결
router.get('/', getPostsController);
router.get('/:postId',getPostController);
router.post('/', createPostController);
router.put('/:postId', editPostController);

export default router;