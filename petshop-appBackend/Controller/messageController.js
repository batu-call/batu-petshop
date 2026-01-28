import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import Message from "../Models/messageSchema.js";

export const createMessage = catchAsyncError(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newMessage = await Message.create({
    name,
    email,
    subject,
    message,
    status: "New",
    user: req.user?._id,
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully!",
    data: newMessage,
  });
});

export const getAllMessages = catchAsyncError(async (req, res, next) => {
  const {
    page = 1,
    search,
    status,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const limit = 15;
  const skip = (Number(page) - 1) * limit;

  // Build query
  let query = {};

  // Search filter (name, email, subject, message)
  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (search && typeof search === "string") {
    const safeSearch = escapeRegex(search.trim().slice(0, 50));

    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { subject: { $regex: safeSearch, $options: "i" } },
      { message: { $regex: safeSearch, $options: "i" } },
    ];
  }

 const allowedStatuses = ["New", "Read", "Replied"];
if (status && allowedStatuses.includes(status)) {
  query.status = status;
}

  // Date range filter
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) {
      query.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDate;
    }
  }

  // Get total count
  const totalMessages = await Message.countDocuments(query);

  // Build sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Get messages with pagination
  const messages = await Message.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate("user", "")
    .lean();

  const mappedMessages = messages.map((msg) => ({
    id: msg._id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    date: msg.createdAt
      ? new Date(msg.createdAt).toLocaleDateString()
      : "Yesterday",
    status: msg.status || "New",
    avatar: msg.user?.avatar || null,
    userId: msg.user?._id || null,
    initials: msg.name
      ? msg.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "NA",
  }));

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(totalMessages / limit),
    totalMessages,
    currentPage: Number(page),
    messages: mappedMessages,
  });
});

export const updateMessageStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["New", "Read", "Replied"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  const updated = await Message.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );

  if (!updated) {
    return res.status(404).json({ error: "Message not found." });
  }

  res.status(200).json({
    success: true,
    message: "Status updated successfully.",
    data: updated,
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
    status: msg.status || "New",
    initials: msg.name
      ? msg.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
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
