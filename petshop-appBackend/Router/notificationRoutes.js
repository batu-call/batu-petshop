import express from 'express';
import { 
  sendBulkEmail, 
  sendEmailToUsers
} from '../Controller/notificationController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import { bulkEmailLimiter } from '../Middlewares/Ratelimiter.js';

const router = express.Router();

router.post('/bulk-email', isAdminAuthenticated,bulkEmailLimiter,sendBulkEmail);
router.post('/send-to-users', isAdminAuthenticated,bulkEmailLimiter,sendEmailToUsers);

export default router;