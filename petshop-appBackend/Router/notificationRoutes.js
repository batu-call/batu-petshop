import express from 'express';
import {
  sendBulkEmail,
  sendEmailToUsers,
  getMailHistory,
  deleteMailHistory,
  getNotificationStats,
} from '../Controller/notificationController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import { bulkEmailLimiter } from '../Middlewares/Ratelimiter.js';

const router = express.Router();

router.get('/stats', isAdminAuthenticated, getNotificationStats);
router.post('/bulk-email', isAdminAuthenticated, bulkEmailLimiter, sendBulkEmail);
router.post('/send-to-users', isAdminAuthenticated, bulkEmailLimiter, sendEmailToUsers);
router.get('/history', isAdminAuthenticated, getMailHistory);
router.delete('/history/:id', isAdminAuthenticated, deleteMailHistory);

export default router;