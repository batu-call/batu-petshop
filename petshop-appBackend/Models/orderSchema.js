import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, max: 999 },
        image: String,
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true, trim: true, maxlength: 100 },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      },
      city: { type: String, required: true, trim: true, maxlength: 50 },
      phoneNumber: { type: String, required: true, trim: true, maxlength: 20 },
      address: { type: String, required: true, trim: true, maxlength: 200 },
      postalCode: { type: String, trim: true, maxlength: 20 },
    },

    paymentResult: {
      id: { type: String },
      status: {
        type: String,
        enum: ["pending", "succeeded", "failed", "refunded"],
      },
      updateTimes: String,
      email_address: String,
    },

    totalAmount: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "", trim: true, maxlength: 50 },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "cancellation_requested",
      ],
      default: "pending",
    },
    cancelReason: {
      type: String,
      default: "",
    },

    tracking: {
      trackingNumber: { type: String, trim: true, maxlength: 100, default: "" },
      cargoCompany: {
        type: String,
        enum: ["UPS", "DHL", "FedEx", "USPS", "Other", ""],
        default: "",
      },
      trackingUrl: { type: String, default: "" },
      estimatedDelivery: { type: Date, default: null },
      shippedAt: { type: Date, default: null },
    },

    idempotencyKey: { type: String },

    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    note: { type: String, trim: true, maxlength: 500 },
    deliveredAt: Date,
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production",
  },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "paymentResult.id": 1 }, { unique: true, sparse: true });
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }

  if (
    this.isModified("tracking.trackingNumber") ||
    this.isModified("tracking.cargoCompany")
  ) {
    const num = this.tracking?.trackingNumber;
    const company = this.tracking?.cargoCompany;
    if (num && company) {
      const urls = {
        UPS: `https://www.ups.com/track?tracknum=${num}`,
        DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${num}`,
        FedEx: `https://www.fedex.com/fedextrack/?trknbr=${num}`,
        USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`,
        Other: "",
      };
      this.tracking.trackingUrl = urls[company] || "";
    }
  }

  next();
});

orderSchema.statics.createOrderSafely = async function (orderData, session) {
  const existingQuery = [];
  if (orderData.idempotencyKey)
    existingQuery.push({ idempotencyKey: orderData.idempotencyKey });
  if (orderData.paymentResult?.id)
    existingQuery.push({ "paymentResult.id": orderData.paymentResult.id });

  if (existingQuery.length > 0) {
    const existing = await this.findOne({ $or: existingQuery }).session(
      session,
    );
    if (existing) return { existing: true, order: existing };
  }

  try {
    const [order] = await this.create([orderData], { session });
    return { existing: false, order };
  } catch (error) {
    if (error.code === 11000) {
      const existing = await this.findOne({ $or: existingQuery }).session(
        session,
      );
      if (existing) return { existing: true, order: existing };
    }
    throw error;
  }
};

orderSchema.methods.updateStatus = async function (newStatus, note = "") {
  this.status = newStatus;
  if (note) this.note = note;
  if (newStatus === "delivered" && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (newStatus === "shipped" && !this.tracking?.shippedAt) {
    if (!this.tracking) this.tracking = {};
    this.tracking.shippedAt = new Date();
  }
  return this.save();
};

export const Order = mongoose.model("Order", orderSchema);
