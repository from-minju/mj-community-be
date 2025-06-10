import express from 'express';
import { loginController, signupController, checkAuthenticationController, logoutController } from '../controllers/authController.js';

const router = express.Router();

router.get('/check', checkAuthenticationController);
router.post('/signup',signupController);
router.post('/login', loginController);
router.post('/logout', logoutController);


export default router;
