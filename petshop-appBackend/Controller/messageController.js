import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import Message from "../Models/messageSchema.js";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeObjectId,
  buildSafePagination,
  createSafeRegex,
  validateRequiredFields,
} from "../utils/securityHelper.js";

const VALID_STATUSES = ["New", "Read", "Replied"];
const ALLOWED_SORT_FIELDS = ["createdAt", "name", "email", "status"];

export const createMessage = catchAsyncError(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  try {
    validateRequiredFields(req.body, ['name', 'email', 'subject', 'message']);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const newMessage = await Message.create({
    name: sanitizeString(name),
    email: sanitizedEmail,
    subject: sanitizeString(subject),
    message: sanitizeString(message),
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

  const { page: safePage, limit, skip } = buildSafePagination(page, 15);

  let query = {};

  if (search && typeof search === "string") {
    const regex = createSafeRegex(search, 50);
    
    if (regex) {
      query.$or = [
        { name: regex },
        { email: regex },
        { subject: regex },
        { message: regex },
      ];
    }
  }

  if (status && VALID_STATUSES.includes(status)) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) {
      const start = new Date(dateFrom);
      if (!isNaN(start.getTime())) {
        query.createdAt.$gte = start;
      }
    }
    if (dateTo) {
      const end = new Date(dateTo);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
  }

  const totalMessages = await Message.countDocuments(query);

  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const sortOptions = {};
  sortOptions[safeSortBy] = sortOrder === "asc" ? 1 : -1;

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
    currentPage: safePage,
    messages: mappedMessages,
  });
});

export const updateMessageStatus = catchAsyncError(async (req, res, next) => {
  let messageId;
  try {
    messageId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const updated = await Message.findByIdAndUpdate(
    messageId,
    { status },
    { new: true },
  );

  if (!updated) {
    return res.status(404).json({ error: "Message not found" });
  }

  res.status(200).json({
    success: true,
    message: "Status updated successfully",
    data: updated,
  });
});

export const getUserMessages = catchAsyncError(async (req, res, next) => {
  let userEmail;
  try {
    userEmail = sanitizeEmail(req.params.email);
  } catch (error) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const messages = await Message.find({ email: userEmail }).sort({ createdAt: -1 });

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
  let messageId;
  try {
    messageId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  const deleted = await Message.findByIdAndDelete(messageId);

  if (!deleted) {
    return res.status(404).json({ error: "Message not found" });
  }

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});

export const replyToMessage = catchAsyncError(async (req, res, next) => {
  const { messageId } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return res.status(400).json({ error: "Reply message is required" });
  }

  let validMessageId;
  try {
    validMessageId = sanitizeObjectId(messageId);
  } catch (error) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  const message = await Message.findById(validMessageId);

  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  const { sendAutoMail } = await import("./mailController.js");
  
  try {
    await sendAutoMail({
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #97cba9 0%, #7fb894 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Reply from Petshop Support</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hello ${sanitizeString(message.name)}!</p>
            
            <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 20px 0;">
              Thank you for contacting us. Here's our response to your inquiry:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #97cba9; margin: 20px 0;">
              <p style="color: #333; line-height: 1.8; margin: 0;">
                ${sanitizeString(replyMessage).replace(/\n/g, '<br/>')}
              </p>
            </div>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; font-size: 13px; margin: 0;"><strong>Your original message:</strong></p>
              <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">"${sanitizeString(message.message)}"</p>
            </div>
            
            <p style="font-size: 15px; color: #666; line-height: 1.6; margin: 20px 0;">
              If you have any further questions, please don't hesitate to reach out to us again.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="color: #97cba9; font-weight: bold;">Best regards,</p>
              <p style="color: #666;">Petshop Support Team</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Petshop. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    message.status = "Replied";
    await message.save();

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Failed to send reply:", error);
    return res.status(500).json({ error: "Failed to send reply email" });
  }
});