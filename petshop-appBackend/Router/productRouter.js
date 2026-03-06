import express from "express";
import {
  deleteProduct,
  deleteProductImage,
  featuredProducts,
  getAdminAllProduct,
  getAdminProductBySlug,
  getAllProduct,
  getHotDeals,
  getLatestProduct,
  getPriceStats,
  getProductById,
  getProductBySlug,
  getProductStats,
  getSimilarProducts,
  newProduct,
  searchProducts,
  updateProductController,
} from "../Controller/product/index.js";
import { isAdminAuthenticated } from "../Middlewares/Auth.js";
import upload from "../Config/multer.js";
import {
  productBrowseLimiter,
  searchLimiter,
  adminWriteLimiter,
} from "../Middlewares/Ratelimiter.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/latest/products", productBrowseLimiter, getLatestProduct);
router.get("/products/slug/:slug", productBrowseLimiter, getProductBySlug);
router.get("/products/:id", productBrowseLimiter, getProductById);
router.get("/products", productBrowseLimiter, getAllProduct);
router.get("/similar/:productId", productBrowseLimiter, getSimilarProducts);
router.get("/hot-deals", productBrowseLimiter, getHotDeals);
router.get("/featured-product", productBrowseLimiter, featuredProducts);
router.get("/price-stats", productBrowseLimiter, getPriceStats);

router.get("/search", searchLimiter, searchProducts);

// ADMIN READ ROUTES
router.get("/stats", isAdminAuthenticated, getProductStats);
router.get("/admin/products", isAdminAuthenticated, getAdminAllProduct);
router.get(
  "/admin/products/slug/:slug",
  isAdminAuthenticated,
  getAdminProductBySlug,
);

// ADMIN WRITE
router.post(
  "/products",
  isAdminAuthenticated,
  adminWriteLimiter,
  upload.array("images", 6),
  newProduct,
);

router.put(
  "/update/:id",
  isAdminAuthenticated,
  adminWriteLimiter,
  upload.array("images", 6),
  updateProductController,
);

router.delete(
  "/products/:id",
  isAdminAuthenticated,
  adminWriteLimiter,
  deleteProduct,
);
router.delete(
  "/:productId/image/:imageId",
  isAdminAuthenticated,
  adminWriteLimiter,
  deleteProductImage,
);

export default router;
