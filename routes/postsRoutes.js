import express from 'express';

const router = express.Router();

import {getPosts} from '../controllers/postsController.js';

router.get('/', getPosts);

export default router;