import express from "express";
import { getAnalytics } from "../Controller/getAnalyticsController.js";
import { isAdminAuthenticated } from "../Middlewares/Auth.js";


const router = express.Router();

router.get("/", isAdminAuthenticated,getAnalytics);

export default router;
