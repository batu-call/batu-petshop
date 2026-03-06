import express from "express";
import {
  AllOrders,
  createOrder,
  getOrderByStatus,
  getOrder,
  getOrderByUserId,
  getOrderStats,
  getUserOrder,
  MarkOrderAsDelivered,
  requestCancellation,
  stripeWebhook,
  updateOrderStatus,
  updateOrderToPaid,
  updateTracking,
} from "../Controller/order/index.js";
import {
  isAdminAuthenticated,
  isUserAuthenticated,
} from "../Middlewares/Auth.js";
import { orderLimiter, webhookLimiter } from "../Middlewares/Ratelimiter.js";

const router = express.Router();

router.get("/stats", isAdminAuthenticated, getOrderStats);
router.get("/status/filter", isAdminAuthenticated, getOrderByStatus);

router.get("/allOrders", isAdminAuthenticated, AllOrders);
router.get("/meOrders", isUserAuthenticated, getUserOrder);

router.post("/", isUserAuthenticated, orderLimiter, createOrder);
router.post("/webhook", webhookLimiter, stripeWebhook);

router.get("/orders/:id", isAdminAuthenticated, getOrderByUserId);


router.put("/:id/pay", isUserAuthenticated, updateOrderToPaid);
router.put("/:id/cancel-request", isUserAuthenticated, requestCancellation);
router.put("/:id/status", isAdminAuthenticated, updateOrderStatus);
router.put("/:id/tracking", isAdminAuthenticated, updateTracking);
router.put("/:id/deliver", isAdminAuthenticated, MarkOrderAsDelivered);

router.get("/:id", isAdminAuthenticated, getOrder);

export default router;
