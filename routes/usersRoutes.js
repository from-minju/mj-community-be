import express from 'express';
import { editProfileController, changePasswordController, getUserProfileController, checkEmailController, checkNicknameController, deleteAccountController } from '../controllers/usersController.js';
import { upload } from '../middleware/multer.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId/profile', checkAuth, getUserProfileController);
router.put('/profile', checkAuth, upload.single('profileImage'), editProfileController);
router.patch('/profile/password', checkAuth, changePasswordController);
router.post('/check-email', checkEmailController);
router.post('/check-nickname', checkNicknameController);
router.delete('', checkAuth, deleteAccountController);

export default router;
