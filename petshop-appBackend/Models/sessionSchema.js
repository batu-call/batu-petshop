import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

sessionSchema.pre("save", function (next) {
  if (this.endedAt && !this.duration) {
    this.duration = this.endedAt.getTime() - this.startedAt.getTime();
  }
  next();
});

export const Session = mongoose.model("Session", sessionSchema);
