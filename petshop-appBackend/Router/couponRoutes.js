import express from 'express';
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
} from '../Controller/couponController.js';
import { isUserAuthenticated, isAdminAuthenticated } from '../Middlewares/Auth.js';
import { couponLimiter, adminActionLimiter } from '../Middlewares/Ratelimiter.js';

const router = express.Router();

router.post("/apply", isUserAuthenticated, couponLimiter, applyCoupon); 

// Admin
router.post("/", isAdminAuthenticated, adminActionLimiter, createCoupon);
router.put("/:id", isAdminAuthenticated, adminActionLimiter, updateCoupon);
router.delete("/:id", isAdminAuthenticated, adminActionLimiter, deleteCoupon);

// Public/Read 
router.get("/", getCoupons); 
router.get("/:id", getCouponById);

export default router;