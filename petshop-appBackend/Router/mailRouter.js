import express from "express"
import { sendMail } from "../Controller/mailController.js";
import { mailLimiter } from "../Middlewares/Ratelimiter.js";

    const router = express.Router();

router.post("/sendMail",mailLimiter,sendMail);




export default router