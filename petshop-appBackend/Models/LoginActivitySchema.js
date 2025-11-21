import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginAt: { type: Date, default: Date.now },
});

export const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
