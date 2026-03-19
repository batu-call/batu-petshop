import { getCookieOptions } from './cookieHelper.js';

export const generateToken = (user, message, statusCode, res, rememberMe = false) => {
  const token = user.generateJsonWebToken(rememberMe);
  const cookieName = user.role === "Admin" ? "AdminToken" : "UserToken";

  const options = {
    ...getCookieOptions(),
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000,
  };

  const safeUser = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar,
    role: user.role,
    authProvider: user.authProvider,
    notificationSettings: user.notificationSettings,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res
    .status(statusCode)
    .cookie(cookieName, token, options)
    .json({
      success: true,
      message,
      user: safeUser,
    });
};

export default generateToken;