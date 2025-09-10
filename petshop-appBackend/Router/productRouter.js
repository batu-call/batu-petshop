import express from 'express'
import { deleteProduct, getAllProduct, getProduct, newProduct } from '../Controller/productController.js';
import upload from '../Config/multer';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';

    const router = express.Router();

router.post("/products",upload.single("image"),isAdminAuthenticated,newProduct);

router.get("/products",getAllProduct);
router.get("/products/:id",getProduct);

router.delete("/products/:id",isAdminAuthenticated,deleteProduct)