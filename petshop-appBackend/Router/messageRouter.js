import express from "express";
import {
  createMessage,
  deleteMessage,
  getAllMessages,
  getUserMessages,
  updateMessageStatus,
} from "../Controller/messageController.js";
import {
  isAdminAuthenticated,
  isUserAuthenticated,
} from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/add", isUserAuthenticated, createMessage);

router.get("/", isAdminAuthenticated, getAllMessages);

router.put("/:id/status", isAdminAuthenticated, updateMessageStatus);

router.get("/user/:email", isAdminAuthenticated, getUserMessages);

router.delete("/:id", isAdminAuthenticated, deleteMessage);

export default router;
