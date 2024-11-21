import express from 'express';
import { editProfileController, changePasswordController, getUserProfileController } from '../controllers/usersController.js';

const router = express.Router();

router.get('/:userId', getUserProfileController);
router.put('/:userId/profile', editProfileController);
router.patch('/:userId/profile/password', changePasswordController);

export default router;
