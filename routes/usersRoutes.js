import express from 'express';
import { editProfileController, changePasswordController, getUserProfileController, checkEmailController, checkNicknameController } from '../controllers/usersController.js';

const router = express.Router();

router.get('/:userId/profile', getUserProfileController);
router.put('/:userId/profile', editProfileController);
router.patch('/:userId/profile/password', changePasswordController);
router.get('/check-email', checkEmailController);
router.get('/check-nickname', checkNicknameController);

export default router;
