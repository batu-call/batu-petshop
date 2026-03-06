import express from "express";
import { isAdminAuthenticated, isUserAuthenticated } from "../Middlewares/Auth.js";
import { adminChat, getChatHistory, clearChatSession } from "../Controller/ai/adminChat.js";
import { customerChat } from "../Controller/ai/customerChat.js";

const router = express.Router();

// Admin
router.post("/admin/chat",                    isAdminAuthenticated, adminChat);
router.get("/admin/chat/history/:sessionId",  isAdminAuthenticated, getChatHistory);
router.delete("/admin/chat/:sessionId",       isAdminAuthenticated, clearChatSession);

// Customer
router.post("/customer/chat", isUserAuthenticated, customerChat);

export default router;