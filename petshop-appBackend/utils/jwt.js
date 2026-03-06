import { getCookieOptions } from './cookieHelper.js';

export const generateToken = (user, message, statusCode, res, rememberMe = false) => {
  const token = user.generateJsonWebToken(rememberMe);
  const cookieName = user.role === "Admin" ? "AdminToken" : "UserToken";

  const options = {
    ...getCookieOptions(),
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000  // 30 day
      : 24 * 60 * 60 * 1000,       // 1 day
  };

  res
    .status(statusCode)
    .cookie(cookieName, token, options)
    .json({
      success: true,
      message,
      user,
      token,
    });
};

export default generateToken;