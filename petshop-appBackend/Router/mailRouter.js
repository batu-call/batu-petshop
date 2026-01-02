import express from "express"
import { sendMail } from "../Controller/mailController.js";

    const router = express.Router();

router.post("/sendMail", sendMail);




export default router