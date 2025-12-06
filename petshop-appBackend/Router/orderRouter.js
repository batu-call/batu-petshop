import express from 'express'
import { 
  AllOrders, 
  createOrder, 
  getOrdeByStatus, 
  getOrder, 
  getOrderByUserId, 
  getOrderStats, 
  getUserOrder, 
  MarkOrderAsDelivered, 
  updateOrderStatus, 
  updateOrderToPaid 
} from '../Controller/orderController.js'
import { isAdminAuthenticated, isUserAuthenticated } from '../Middlewares/Auth.js';

const router = express.Router();

router.get("/stats", isAdminAuthenticated, getOrderStats);
router.get("/status/filter", isAdminAuthenticated, getOrdeByStatus);

router.get("/allOrders", isAdminAuthenticated, AllOrders);
router.get("/meOrders", isUserAuthenticated, getUserOrder);

router.post("/", isUserAuthenticated, createOrder);

router.get("/orders/:id", isAdminAuthenticated, getOrderByUserId);

router.put("/:id/pay", isUserAuthenticated, updateOrderToPaid);
router.put("/:id/status", isAdminAuthenticated, updateOrderStatus);
router.put("/:id/deliver", isAdminAuthenticated, MarkOrderAsDelivered);

router.get("/:id", isAdminAuthenticated, getOrder);

export default router;
