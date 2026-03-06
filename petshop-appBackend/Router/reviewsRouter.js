import express from "express";
import {
  addReviews,
  adminDeleteReview,
  deleteReviews,
  getAllReviewsCount,
  getReviews,

  getReviewStats,

  getUserReviews,
  toggleHelpful,
} from "../Controller/reviewsController.js";
import { isAdminAuthenticated, isUserAuthenticated } from "../Middlewares/Auth.js";
import { reviewLimiter } from "../Middlewares/Ratelimiter.js";

const router = express.Router();

router.post("/add", isUserAuthenticated,reviewLimiter, addReviews);
router.get("/counts", getAllReviewsCount);
router.get("/:user/:id",isAdminAuthenticated,getUserReviews);
router.get("/stats", getReviewStats);
router.put("/helpful/:id", isUserAuthenticated,reviewLimiter, toggleHelpful);
router.get("/:productId", getReviews);
router.delete("/:id", isUserAuthenticated ,reviewLimiter,deleteReviews);
router.delete("/admin/:id",isAdminAuthenticated ,adminDeleteReview);


export default router;
