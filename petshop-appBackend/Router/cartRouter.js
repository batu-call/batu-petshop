import express from 'express';
import { addToCart, clearCart, getCart, removeCoupon, removeFromCart, updateQuantity } from '../Controller/cartController.js';
import { isUserAuthenticated } from '../Middlewares/Auth.js';
import { cartLimiter } from '../Middlewares/Ratelimiter.js';

const router = express.Router();

router.post("/addCart", isUserAuthenticated, cartLimiter, addToCart);
router.post("/remove-coupon", isUserAuthenticated, cartLimiter, removeCoupon);
router.put("/updateQuantity", isUserAuthenticated, cartLimiter, updateQuantity);
router.delete("/removeCart/:productId", isUserAuthenticated, cartLimiter, removeFromCart);
router.delete("/removeAllCart", isUserAuthenticated, cartLimiter, clearCart);


router.get("/getCart", isUserAuthenticated, getCart);

export default router;