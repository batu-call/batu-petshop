import express from 'express'
import { deleteProduct, getAdminAllProduct, getAdminProductBySlug, getAllProduct, getHotDeals, getLatestProduct, getProduct, getProductBySlug, getSimilarProducts, newProduct, searchProducts, updateProductController } from '../Controller/productController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import upload from "../Config/multer.js"

    const router = express.Router();

router.post("/products",isAdminAuthenticated,upload.single("image"),newProduct);
router.put("/update/:id", updateProductController);
router.delete("/products/:id",isAdminAuthenticated,deleteProduct);

router.get("/search",searchProducts);
router.get("/latest/products",getLatestProduct);
router.get("/products/slug/:slug", getProductBySlug);
router.get("/products/:id",getProduct);
router.get("/products",getAllProduct);
router.get("/similar/:productId", getSimilarProducts);
router.get("/hot-deals", getHotDeals);


router.get("/admin/products", isAdminAuthenticated, getAdminAllProduct);
router.get("/admin/products/slug/:slug", isAdminAuthenticated, getAdminProductBySlug);


export default router;