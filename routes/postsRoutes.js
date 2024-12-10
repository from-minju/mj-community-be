import express from 'express';
import {
    getPostsController, getPostController, createPostController, editPostController, deletePostController, 
    getCommentsController, createCommentController, editCommentController, deleteCommentController,
    likePostController, unlikePostController
} from '../controllers/postsController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// 게시물 라우터 연결
router.get('/', getPostsController);
router.get('/:postId',getPostController);
router.post('/', upload.single('postImage'),createPostController);
router.put('/:postId', editPostController);
router.delete('/:postId', deletePostController);

// 댓글 라우터 연결
router.get('/:postId/comments', getCommentsController);
router.post('/:postId/comments', createCommentController);
router.put('/:postId/comments/:commentId', editCommentController);
router.delete('/:postId/comments/:commentId', deleteCommentController);

// 좋아요 라우터 연결
router.post('/posts/:postId/likes', likePostController);
router.delete('/posts/:postId/likes', unlikePostController);


export default router;