import { getCookieOptions } from './cookieHelper.js';

export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  const cookieName = user.role === "Admin" ? "AdminToken" : "UserToken";
  
  res
    .status(statusCode)
    .cookie(cookieName, token, getCookieOptions())
    .json({
      success: true,
      message,
      user,
      token,
    });
};

export default generateToken;