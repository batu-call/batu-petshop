import express from "express";
import {
  addReviews,
  deleteReviews,
  getReviews,
} from "../Controller/reviewsController.js";
import { isAdminAuthenticated, isUserAuthenticated } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/add", isUserAuthenticated, addReviews);
router.get("/:productId", getReviews);
router.delete("/:id", isAdminAuthenticated, isUserAuthenticated, deleteReviews);


export default router;
