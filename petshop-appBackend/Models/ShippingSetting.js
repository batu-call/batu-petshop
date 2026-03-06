import mongoose from "mongoose";

const shippingSettingSchema = new mongoose.Schema(
  {
    fee: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Shipping fee cannot be negative"],
      max: [1000, "Shipping fee cannot exceed 1000"],
    },
    freeOver: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Free shipping threshold cannot be negative"],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


shippingSettingSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create({
      fee: 0,
      freeOver: 0,
    });
  }
  
  return settings;
};


shippingSettingSchema.methods.calculateShipping = function (orderTotal) {
  if (!this.enabled) return 0;
  if (this.freeOver > 0 && orderTotal >= this.freeOver) return 0;
  return this.fee;
};

export default mongoose.model("ShippingSetting", shippingSettingSchema);