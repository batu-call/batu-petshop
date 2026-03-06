import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { User } from "../Models/userSchema.js";
import { sendAutoMail } from "./mailController.js";
import { sanitizeString, sanitizeEmail } from "../utils/securityHelper.js";

export const sendBulkEmail = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  const { subject, message, notificationType } = req.body;

  if (!subject || !message || !notificationType) {
    return next(new ErrorHandler("Subject, message and notification type are required", 400));
  }

  const validTypes = ['emailNotifications', 'systemAlerts', 'newsletter'];
  if (!validTypes.includes(notificationType)) {
    return next(new ErrorHandler("Invalid notification type", 400));
  }

  const filter = {
    role: 'User',
    [`notificationSettings.${notificationType}`]: true
  };

  const users = await User.find(filter).select('email firstName');

  if (users.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No users found with this notification setting enabled",
      sentCount: 0
    });
  }

  let successCount = 0;
  let failCount = 0;
  const failedEmails = [];

  for (const user of users) {
    try {
      await sendAutoMail({
        to: user.email,
        subject: sanitizeString(subject),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #97cba9 0%, #7fb894 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${sanitizeString(subject)}</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333;">Hello ${user.firstName}!</p>
              
              <div style="line-height: 1.8; color: #666; font-size: 15px; margin: 20px 0;">
                ${sanitizeString(message).replace(/\n/g, '<br/>')}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; line-height: 1.6;">
                  You received this email because you subscribed to our notifications.
                  You can manage your notification preferences in your account settings.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Petshop. All rights reserved.</p>
            </div>
          </div>
        `,
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error.message);
      failCount++;
      failedEmails.push(user.email);
    }
  }

  res.status(200).json({
    success: true,
    message: `Emails sent successfully`,
    sentCount: successCount,
    failedCount: failCount,
    totalUsers: users.length,
    failedEmails: failedEmails.length > 0 ? failedEmails : undefined
  });
});

export const sendEmailToUsers = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  const { userIds, subject, message } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new ErrorHandler("User IDs array is required", 400));
  }

  if (!subject || !message) {
    return next(new ErrorHandler("Subject and message are required", 400));
  }

  const users = await User.find({
    _id: { $in: userIds },
    role: 'User'
  }).select('email firstName notificationSettings');

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    if (user.notificationSettings.emailNotifications || 
        user.notificationSettings.systemAlerts || 
        user.notificationSettings.newsletter) {
      try {
        await sendAutoMail({
          to: user.email,
          subject: sanitizeString(subject),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #97cba9 0%, #7fb894 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${sanitizeString(subject)}</h1>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; color: #333;">Hello ${user.firstName}!</p>
                
                <div style="line-height: 1.8; color: #666; font-size: 15px; margin: 20px 0;">
                  ${sanitizeString(message).replace(/\n/g, '<br/>')}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Petshop. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
        failCount++;
      }
    }
  }

  res.status(200).json({
    success: true,
    message: `Emails sent successfully`,
    sentCount: successCount,
    failedCount: failCount,
    totalUsers: users.length
  });
});