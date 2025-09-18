import express from 'express'
import { addToCart, getCart, removeAllCart, removeFromCart } from '../Controller/cartController';
import { isUserAuthenticated } from '../Middlewares/Auth';

    const router = express.Router();


router.post("/addCart",isUserAuthenticated,addToCart);
router.get("/getCart",isUserAuthenticated,getCart);
router.delete("/removeCart/:productId",isUserAuthenticated,removeFromCart);
router.delete("/removeAllCart",isUserAuthenticated,removeAllCart);

export default router;