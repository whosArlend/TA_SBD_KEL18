import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadRoomImage } from './upload.controller.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/room-image', authenticate, upload.single('image'), uploadRoomImage);

export default router;
