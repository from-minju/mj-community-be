import express from 'express';
import { loginController, signupController, statusController } from '../controllers/authController.js';

const router = express.Router();

router.get('/status', statusController);
router.post('/signup', signupController);
router.post('/login', loginController);


export default router;
