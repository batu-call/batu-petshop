import express from 'express'
import { createOrder, getOrder, getUserOrder, updateOrderStatus, updateOrderToPaid } from '../Controller/orderController.js'
import { isAdminAuthenticated, isUserAuthenticated } from '../Middlewares/Auth.js';

    const router = express.Router()


router.post("/",isUserAuthenticated,createOrder);
router.get("/:id",isAdminAuthenticated,getOrder);
router.get("/meOrders",isUserAuthenticated,getUserOrder);
router.put("/:id/pay",isUserAuthenticated,updateOrderToPaid);
router.put("/:id/status",isAdminAuthenticated,updateOrderStatus);   



export default router;