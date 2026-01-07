import express from 'express'
import { addToCart, clearCart, getCart, removeCoupon, removeFromCart, updateQuantity } from '../Controller/cartController.js';
import { isUserAuthenticated } from '../Middlewares/Auth.js';

    const router = express.Router();


router.post("/addCart",isUserAuthenticated,addToCart);
router.post("/remove-coupon",isUserAuthenticated,removeCoupon);
router.get("/getCart",isUserAuthenticated,getCart);
router.put("/updateQuantity",isUserAuthenticated,updateQuantity);
router.delete("/removeCart/:productId",isUserAuthenticated,removeFromCart);
router.delete("/removeAllCart",isUserAuthenticated,clearCart);

export default router;