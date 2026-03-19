import express from "express";
import { getShippingSettings, updateShippingSettings } from "../Controller/shippingController.js";
import { isAdminAuthenticated } from "../Middlewares/Auth.js";
import { getShippingContent, updateShippingContent } from "../Controller/shippingContentController.js";

const router = express.Router();

router.get("/", getShippingSettings);
router.put("/", isAdminAuthenticated, updateShippingSettings);


//content
router.get("/content", getShippingContent);
router.put("/content", isAdminAuthenticated, updateShippingContent);

export default router;
