import mongoose from "mongoose";

const mailHistorySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      enum: ["emailNotifications", "systemAlerts", "newsletter", "all", null],
      default: null,
    },
    sentTo: [
      {
        type: String,
      },
    ],
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mode: {
      type: String,
      enum: ["bulk", "targeted"],
      default: "bulk",
    },
  },
  { timestamps: true }
);

export const MailHistory = mongoose.model("MailHistory", mailHistorySchema);