import express from "express";
import { getShippingSettings, updateShippingSettings } from "../Controller/shippingController.js";
import { isAdminAuthenticated } from "../Middlewares/Auth.js";

const router = express.Router();

router.get("/", getShippingSettings);
router.put("/", isAdminAuthenticated, updateShippingSettings);

export default router;
