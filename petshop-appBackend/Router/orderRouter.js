import express from 'express'
import { AllOrders, createOrder, getOrdeByStatus, getOrder, getOrderStats, getUserOrder, MarkOrderAsDelivered, updateOrderStatus, updateOrderToPaid } from '../Controller/orderController.js'
import { isAdminAuthenticated, isUserAuthenticated } from '../Middlewares/Auth.js';

    const router = express.Router()


router.get("/stats",isAdminAuthenticated,getOrderStats);   
router.post("/",isUserAuthenticated,createOrder);
router.get("/allOrders",isAdminAuthenticated,AllOrders);
router.get("/meOrders",isUserAuthenticated,getUserOrder);
router.get("/:id",isAdminAuthenticated,getOrder);
router.put("/:id/pay",isUserAuthenticated,updateOrderToPaid);
router.put("/:id/status",isAdminAuthenticated,updateOrderStatus);   
router.get("/status/filter",isAdminAuthenticated,getOrdeByStatus);   
router.put("/:id/deliver",isAdminAuthenticated,MarkOrderAsDelivered);   



export default router;