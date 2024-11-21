import express from 'express';
import {
    getPostsController, getPostController, createPostController, editPostController, deletePostController, 
    getCommentsController, createCommentController, editCommentController, deleteCommentController
} from '../controllers/postsController.js';

const router = express.Router();

// 게시물 라우터 연결
router.get('/', getPostsController);
router.get('/:postId',getPostController);
router.post('/', createPostController);
router.put('/:postId', editPostController);
router.delete('/:postId', deletePostController);

// 댓글 라우터 연결
router.get('/:postId/comments', getCommentsController);
router.post('/:postId/comments', createCommentController);
router.put('/:postId/comments/:commentId', editCommentController);
router.delete('/:postId/comments/:commentId', deleteCommentController);


export default router;