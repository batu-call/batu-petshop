import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    enum: ["General Inquiry", "Adoption", "Grooming Services", "Vet Consultation"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);