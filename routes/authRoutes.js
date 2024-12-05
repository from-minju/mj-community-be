import express from 'express';
import { loginController, signupController, checkAuthenticationController } from '../controllers/authController.js';

const router = express.Router();

router.get('/check', checkAuthenticationController);
router.post('/signup', signupController);
router.post('/login', loginController);


export default router;
