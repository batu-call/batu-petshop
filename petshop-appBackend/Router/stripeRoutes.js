import express from "express";
import { createPaymentIntent, createRefund } from "../Controller/stripeController.js";
import {
  isAdminAuthenticated,
  isUserAuthenticated,
} from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent); 
router.post("/refund", isAdminAuthenticated, createRefund); 

export default router;