import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginAt: { type: Date, default: Date.now },
  ipAddress: { type: String, default: "Unknown" },
  userAgent: { type: String, default: "Unknown" },
});

export const LoginActivity = mongoose.model(
  "LoginActivity",
  loginActivitySchema,
);
