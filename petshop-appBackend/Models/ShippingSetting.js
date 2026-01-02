import mongoose from "mongoose";

const shippingSettingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["flat"],
      default: "flat",
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    freeOver: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ShippingSetting",
  shippingSettingSchema
);
