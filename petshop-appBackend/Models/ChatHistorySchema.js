import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "tool", "system"],
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // string veya array (tool calls için)
    required: true,
  },
  tool_calls: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  tool_call_id: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      required: true,
    },
    messages: [messageSchema],
    messageCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Rate limiting için
    dailyMessageCount: {
      type: Number,
      default: 0,
    },
    dailyResetAt: {
      type: Date,
      default: () => {
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        return tomorrow;
      },
    },
  },
  {
    timestamps: true,
  }
);

// 7 gün sonra otomatik sil
chatHistorySchema.index({ lastActivity: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// SessionId + userId üzerinden hızlı arama
chatHistorySchema.index({ sessionId: 1, userId: 1 });

export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);