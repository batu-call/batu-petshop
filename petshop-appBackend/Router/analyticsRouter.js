import express from "express";
import { getAnalytics } from "../Controller/getAnalyticsController.js";


const router = express.Router();

router.get("/", getAnalytics);

export default router;
