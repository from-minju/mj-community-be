import express from 'express';
import { loginController, signupController, checkAuthenticationController, logoutController } from '../controllers/authController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

router.get('/check', checkAuthenticationController);
router.post('/signup',upload.single('profileImage') ,signupController);
router.post('/login', loginController);
router.post('/logout', logoutController);


export default router;
