import express from "express";
import {
  addReviews,
  adminDeleteReview,
  deleteReviews,
  getAllReviewsCount,
  getReviews,

  getUserReviews,
  toggleHelpful,
} from "../Controller/reviewsController.js";
import { isAdminAuthenticated, isUserAuthenticated } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/add", isUserAuthenticated, addReviews);
router.get("/counts", getAllReviewsCount);
router.get("/:user/:id",isAdminAuthenticated,getUserReviews);
router.put("/helpful/:id", isUserAuthenticated, toggleHelpful);
router.get("/:productId", getReviews);
router.delete("/:id", isUserAuthenticated ,deleteReviews);
router.delete("/admin/:id",isAdminAuthenticated ,adminDeleteReview);


export default router;
