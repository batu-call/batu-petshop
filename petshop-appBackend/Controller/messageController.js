import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import Message from "../Models/messageSchema.js";


export const createMessage = catchAsyncError(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newMessage = await Message.create({ name, email, subject, message ,user: req.user?._id});

  res.status(201).json({
    success: true,
    message: "Message sent successfully!",
    data: newMessage,
  });
});


export const getAllMessages = catchAsyncError(async (req, res, next) => {

  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .populate("user", "avatar"); 

  const mappedMessages = messages.map((msg) => ({
    id: msg._id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    date: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Yesterday",
    status: "New",
    avatar: msg.user?.avatar || null, 
    initials: msg.name
      ? msg.name.split(" ").map((n) => n[0]).join("").toUpperCase()
      : "NA",
  }));

  res.status(200).json({
    success: true,
    messages: mappedMessages,
  });
});



export const getUserMessages = catchAsyncError(async (req, res, next) => {
  const { email } = req.params;
  const messages = await Message.find({ email }).sort({ createdAt: -1 });

  const mappedMessages = messages.map((msg) => ({
    id: msg._id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    date: msg.createdAt
      ? new Date(msg.createdAt).toLocaleDateString()
      : "Yesterday",
    status: "New",
    initials: msg.name
      ? msg.name.split(" ").map((n) => n[0]).join("").toUpperCase()
      : "NA",
    avatar: null,
  }));

  res.status(200).json({
    success: true,
    messages: mappedMessages,
  });
});


export const deleteMessage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await Message.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ error: "Message not found." });
  }

  res.status(200).json({
    success: true,
    message: "Message deleted successfully.",
  });
});