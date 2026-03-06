import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { User } from "../../Models/userSchema.js";
import generateToken from "../../utils/jwt.js";
import { sendAutoMail } from "../mailController.js";
import crypto from "crypto";
import { sanitizeEmail, validatePassword } from "../../utils/securityHelper.js";

export const updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user?.id).select("+password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please provide old and new password", 400));
  }

  try {
    validatePassword(newPassword, 6);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) return next(new ErrorHandler("Old password is incorrect", 401));

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully" });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  }

  const user = await User.findOne({ email: sanitizedEmail });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendAutoMail({
      to: user.email,
      subject: "Password Reset Request 🔐",
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset.</p>
        <p>Click the link below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
        <br/>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email could not be sent.", 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    validatePassword(password, 6);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid or expired reset token.", 400));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  generateToken(user, "Password reset successful.", 200, res);
});