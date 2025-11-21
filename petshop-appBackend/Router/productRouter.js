import express from 'express'
import { deleteProduct, getAllProduct, getLatestProduct, getProduct, getProductBySlug, newProduct, updateProductController } from '../Controller/productController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import upload from "../Config/multer.js"

    const router = express.Router();

router.post("/products",isAdminAuthenticated,upload.single("image"),newProduct);

router.get("/products",getAllProduct);
router.get("/products/:id",getProduct);
router.put("/update/:id", updateProductController);
router.get("/latest/products",getLatestProduct);
router.get("/products/slug/:slug", getProductBySlug);
router.delete("/products/:id",isAdminAuthenticated,deleteProduct);


export default router;