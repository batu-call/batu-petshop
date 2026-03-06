import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email"],
    },

    phone: {
      type: String,
      default: "",
      validate: {
        validator: function(v) {
          if (!v || v === "") return true;
          return /^\d{10,15}$/.test(v);
        },
        message: "Phone number must be between 10-15 digits",
      },
    },

    password: {
      type: String,
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    address: {
      type: String,
      default: "",
      maxlength: [200, "Address cannot exceed 200 characters"],
    },

    avatar: {
      type: String,
      default:
        "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg",
    },

    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
        description: "Order confirmations, shipping updates, and delivery notifications"
      },
      systemAlerts: {
        type: Boolean,
        default: true,
        description: "System maintenance, promotions, and important announcements"
      },
      newsletter: {
        type: Boolean,
        default: true,
        description: "Monthly newsletters, new products, and stock alerts"
      },
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.authProvider === "google") {
    return next();
  }

  if (this.authProvider === "local") {
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    
    if (!strongPassword.test(this.password)) {
      const error = new Error("Password must be at least 8 characters and include letters and numbers");
      return next(error);
    }
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function (rememberMe = false) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: rememberMe ? "30d" : "1d",
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model("User", userSchema);