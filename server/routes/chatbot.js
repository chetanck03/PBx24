import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sendMessage, getChatbotInfo, getPhoneData, testChatbot } from '../controllers/chatbotController.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/health', testChatbot);
router.get('/phones', getPhoneData); // Real-time phone data API

// Protected routes (auth required)
router.get('/info', authenticateToken, getChatbotInfo);
router.post('/message', authenticateToken, sendMessage);

export default router;
