import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { User } from "../../Models/userSchema.js";

export const getNotificationSettings = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id).select(
      "notificationSettings",
    );
    if (!user) return next(new ErrorHandler("User not found", 404));

    res
      .status(200)
      .json({ success: true, settings: user.notificationSettings });
  },
);

export const updateNotificationSettings = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const { emailNotifications, systemAlerts, newsletter } = req.body;
    const validBooleans = [true, false];

    if (
      emailNotifications !== undefined &&
      !validBooleans.includes(emailNotifications)
    ) {
      return next(
        new ErrorHandler("Invalid value for emailNotifications", 400),
      );
    }
    if (systemAlerts !== undefined && !validBooleans.includes(systemAlerts)) {
      return next(new ErrorHandler("Invalid value for systemAlerts", 400));
    }
    if (newsletter !== undefined && !validBooleans.includes(newsletter)) {
      return next(new ErrorHandler("Invalid value for newsletter", 400));
    }

    if (emailNotifications !== undefined)
      user.notificationSettings.emailNotifications = emailNotifications;
    if (systemAlerts !== undefined)
      user.notificationSettings.systemAlerts = systemAlerts;
    if (newsletter !== undefined)
      user.notificationSettings.newsletter = newsletter;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      settings: user.notificationSettings,
    });
  },
);
