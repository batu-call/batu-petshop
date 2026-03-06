import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Code must be at least 3 characters"],
      maxlength: [50, "Code cannot exceed 50 characters"],
    },
    percent: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [1, "Discount must be at least 1%"],
      max: [100, "Discount cannot exceed 100%"],
    },
    minAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum amount cannot be negative"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsage: {
      type: Number,
      default: null, 
      min: 1,
    },
    applicableToUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    applicableToProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ status: 1, validUntil: 1 });

couponSchema.virtual("isExpired").get(function () {
  if (!this.validUntil) return false;
  return new Date() > this.validUntil;
});

couponSchema.virtual("isActive").get(function () {
  const now = new Date();
  
  if (!this.status) return false;
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.maxUsage && this.usedCount >= this.maxUsage) return false;
  
  return true;
});

couponSchema.methods.canBeUsed = function (userId = null, productIds = []) {
  if (this.isExpired) return { valid: false, reason: "Coupon has expired" };
  
  if (!this.status) return { valid: false, reason: "Coupon is inactive" };
  
  if (this.validFrom && new Date() < this.validFrom) {
    return { valid: false, reason: "Coupon is not yet active" };
  }
  
  if (this.maxUsage && this.usedCount >= this.maxUsage) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }
  
  if (this.applicableToUsers.length > 0 && userId) {
    if (!this.applicableToUsers.includes(userId)) {
      return { valid: false, reason: "Coupon not applicable to this user" };
    }
  }

  if (this.applicableToProducts.length > 0 && productIds.length > 0) {
    const hasApplicableProduct = productIds.some(pid => 
      this.applicableToProducts.includes(pid)
    );
    if (!hasApplicableProduct) {
      return { valid: false, reason: "Coupon not applicable to cart items" };
    }
  }
  
  return { valid: true };
};

couponSchema.pre("save", function (next) {
  if (this.validFrom && this.validUntil) {
    if (this.validFrom >= this.validUntil) {
      return next(new Error("Valid from date must be before valid until date"));
    }
  }
  next();
});

export default mongoose.model("Coupon", couponSchema);