import express from 'express'
import { addToCart, getCart, removeAllCart, removeFromCart, updateQuantity } from '../Controller/cartController.js';
import { isUserAuthenticated } from '../Middlewares/Auth.js';

    const router = express.Router();


router.post("/addCart",isUserAuthenticated,addToCart);
router.get("/getCart",isUserAuthenticated,getCart);
router.put("/updateQuantity",isUserAuthenticated,updateQuantity);
router.delete("/removeCart/:productId",isUserAuthenticated,removeFromCart);
router.delete("/removeAllCart",isUserAuthenticated,removeAllCart);

export default router;