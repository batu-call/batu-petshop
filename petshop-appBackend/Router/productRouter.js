import express from 'express'
import { deleteProduct, deleteProductImage, featuredProducts, getAdminAllProduct, getAdminProductBySlug, getAllProduct, getHotDeals, getLatestProduct, getPriceStats, getProductById, getProductBySlug, getProductStats, getSimilarProducts, newProduct, searchProducts, updateProductController } from '../Controller/productController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import upload from "../Config/multer.js"

const router = express.Router();

router.post("/products", isAdminAuthenticated, upload.array("images", 6), newProduct);
router.put("/update/:id", isAdminAuthenticated, upload.array("images", 6), updateProductController);
router.delete("/products/:id", isAdminAuthenticated, deleteProduct);

router.delete("/:productId/image/:imageId", isAdminAuthenticated, deleteProductImage);

router.get("/search", searchProducts);
router.get("/stats", isAdminAuthenticated, getProductStats);
router.get("/latest/products", getLatestProduct);
router.get("/products/slug/:slug", getProductBySlug);
router.get("/products/:id", getProductById);
router.get("/products", getAllProduct);
router.get("/similar/:productId", getSimilarProducts);
router.get("/hot-deals", getHotDeals);
router.get("/featured-product", featuredProducts);
router.get("/price-stats", getPriceStats);

router.get("/admin/products", isAdminAuthenticated, getAdminAllProduct);
router.get("/admin/products/slug/:slug", isAdminAuthenticated, getAdminProductBySlug);

export default router;