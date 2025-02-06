import express from 'express';
import {
    getPostsController, getPostController, createPostController, editPostController, deletePostController, 
    getCommentsController, createCommentController, editCommentController, deleteCommentController,
    likePostController, unlikePostController
} from '../controllers/postController.js';
import { upload } from '../middleware/multer.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// 게시물 라우터 연결
router.get('/', getPostsController);
router.get('/:postId', checkAuth, getPostController);
// router.post('/', checkAuth, upload.single('postImage'), createPostController);
router.post('/', checkAuth, createPostController);
router.put('/:postId', checkAuth, upload.single('postImage'), editPostController);
router.delete('/:postId', checkAuth, deletePostController);

// 댓글 라우터 연결
router.get('/:postId/comments', checkAuth, getCommentsController);
router.post('/:postId/comments', checkAuth, createCommentController);
router.put('/:postId/comments/:commentId', checkAuth, editCommentController);
router.delete('/:postId/comments/:commentId', checkAuth, deleteCommentController);

// 좋아요 라우터 연결
router.post('/:postId/likes', checkAuth, likePostController);
router.delete('/:postId/likes', checkAuth, unlikePostController);


export default router;