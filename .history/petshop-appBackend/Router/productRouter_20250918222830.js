import express from 'express'
import { deleteProduct, getAllProduct, getLatestProduct, getProduct, newProduct } from '../Controller/productController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';

    const router = express.Router();

router.post("/products",isAdminAuthenticated,newProduct);

router.get("/products",getAllProduct);
router.get("/products/:id",getProduct);
router.get("/latest/products",getLatestProduct);
router.delete("/products/:id",isAdminAuthenticated,deleteProduct);


export default router;