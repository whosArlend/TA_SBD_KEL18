import express from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.getMe);

export default router;
