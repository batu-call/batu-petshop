import { v4 as uuidv4 } from "uuid";
import { catchAsyncError } from "../../../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../../../Middlewares/errorMiddleware.js";
import { runChat } from "../services/chatService.js";
import { buildSystemPrompt } from "../prompts/systemPrompt.js";
import { ChatHistory } from "../../../../Models/ChatHistorySchema.js";

const DAILY_MAX    = 50;
const SESSION_MAX  = 20;
const MAX_HISTORY  = 10;
const MAX_STORED   = 50; 

// ── Session

const getOrCreateSession = (sessionId, userId) =>
  ChatHistory.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        userId: userId || null,
        role: "customer",
        messages: [],
        messageCount: 0,
        dailyMessageCount: 0,
        dailyResetAt: (() => {
          const t = new Date();
          t.setHours(24, 0, 0, 0);
          return t;
        })(),
      },
    },
    { upsert: true, new: true }
  );

// ── Rate Limit 

const checkRateLimit = (session) => {
  const now = new Date();
  if (session.dailyResetAt < now) {
    session.dailyMessageCount = 0;
    session.dailyResetAt = new Date(now.setHours(24, 0, 0, 0));
  }
  if (session.dailyMessageCount >= DAILY_MAX)
    throw new ErrorHandler(`Daily limit reached (${DAILY_MAX}). Try again tomorrow.`, 429);
  if (session.messageCount >= SESSION_MAX)
    throw new ErrorHandler(`Session limit reached (${SESSION_MAX}). Start a new chat.`, 429);
};

// ── History 

const prepareHistory = (stored) =>
  stored
    .slice(-MAX_HISTORY)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

// ── Push Messages 
// Only user messages count toward rate limits

const pushMessage = (session, role, content, extras = {}) => {
  session.messages.push({ role, content, timestamp: new Date(), ...extras });
  if (role === "user") {
    session.messageCount      += 1;
    session.dailyMessageCount += 1;
  }
  session.lastActivity = new Date();
};

// ── Controller

export const customerChat = catchAsyncError(async (req, res, next) => {
  const { message, sessionId } = req.body;
  if (!message?.trim())     return next(new ErrorHandler("Message required", 400));
  if (message.length > 500) return next(new ErrorHandler("Message too long (max 500 chars)", 400));

  const userId   = req.user?._id?.toString() || null;
  const userName = req.user?.firstName || null;
  const sid      = sessionId || uuidv4();

  const session = await getOrCreateSession(sid, userId);
  checkRateLimit(session);

  const history = prepareHistory(session.messages);
  let answer, newMessages;

  try {
    ({ answer, newMessages } = await runChat(
      buildSystemPrompt(userId, userName),
      message,
      history
    ));
  } catch (err) {
    console.error("[customerChat] error:", err.message);
    if (err.status === 429)
      return res.status(200).json({
        success: true,
        answer: "I'm a bit busy 🐾 Please try again in a few seconds!",
        sessionId: sid,
      });
    return res.status(200).json({
      success: true,
      answer: "Oops, something went wrong 😅 Could you try again?",
      sessionId: sid,
    });
  }

  for (const msg of newMessages) {
    pushMessage(session, msg.role, msg.content, {
      tool_calls:   msg.tool_calls   || null,
      tool_call_id: msg.tool_call_id || null,
    });
  }

  // Prevent unbounded document growth
  if (session.messages.length > MAX_STORED) {
    session.messages = session.messages.slice(-MAX_STORED);
  }

  await session.save();

  res.status(200).json({ success: true, answer, sessionId: sid });
});