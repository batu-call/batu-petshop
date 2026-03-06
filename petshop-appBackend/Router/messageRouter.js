import express from "express";
import {
  createMessage,
  deleteMessage,
  getAllMessages,
  getUserMessages,
  replyToMessage,
  updateMessageStatus,
} from "../Controller/messageController.js";
import {
  isAdminAuthenticated,
  isUserAuthenticated,
} from "../Middlewares/Auth.js";
import { messageLimiter } from "../Middlewares/Ratelimiter.js";

const router = express.Router();

router.post("/add", isUserAuthenticated,messageLimiter,createMessage);

router.get("/", isAdminAuthenticated, getAllMessages);

router.put("/:id/status", isAdminAuthenticated, updateMessageStatus);

router.get("/user/:email", isAdminAuthenticated, getUserMessages);

router.delete("/:id", isAdminAuthenticated, deleteMessage);

router.post("/:messageId/reply", isAdminAuthenticated, replyToMessage);


export default router;
