import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "First Name Must Contain At Least 3 Characters!"],
      maxLength: [30, "First Name must not exceed 30 characters!"],
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
      maxLength: [30, "First Name must not exceed 30 characters!"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Please Provide A Valid Email!"],
    },
    phone: {
      type: String,
      required: true,
      minLength: [8, "Phone Number Must Contain Extact 8 Digits!"],
      maxLength: [15, "Phone Number Must Contain Extact 15 Digits!"],
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password Must Contain At Least 8 Characters!"],
      select: false,
    },
    address: {
      type: String,
      minLength: [12, "Address must be at least 12 characters long!"],
      trim: true,
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
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);
//hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// jwt
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Forgot Password Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
