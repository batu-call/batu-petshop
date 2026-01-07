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

const router = express.Router();

router.post("/apply", isUserAuthenticated, applyCoupon); 
router.post("/", isUserAuthenticated, isAdminAuthenticated, createCoupon);
router.get("/", getCoupons); 
router.get("/:id", getCouponById); 
router.put("/:id", isUserAuthenticated, isAdminAuthenticated, updateCoupon);
router.delete("/:id", isUserAuthenticated, isAdminAuthenticated, deleteCoupon);

export default router;