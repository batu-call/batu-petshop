import express from 'express'
import { createCoupon, deleteCoupon, getCouponById, getCoupons, updateCoupon } from '../Controller/couponController.js';


    const router = express.Router();


router.post("/add",createCoupon)
router.get("/",getCoupons)
router.get("/:id",getCouponById)
router.put("/:id",updateCoupon)
router.delete("/:id",deleteCoupon)


export default router;