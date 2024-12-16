import express from 'express';
import { editProfileController, changePasswordController, getUserProfileController, checkEmailController, checkNicknameController, deleteAccountController } from '../controllers/usersController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

router.get('/:userId/profile', getUserProfileController);
router.put('/profile', upload.single('profileImage'), editProfileController);
router.patch('/profile/password', changePasswordController);
router.post('/check-email', checkEmailController);
router.post('/check-nickname', checkNicknameController);
router.delete('', deleteAccountController);

export default router;
