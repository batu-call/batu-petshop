const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  const cookieName =
    user.role === "Admin" ? "AdminToken" : "UserToken";

  const isProd = process.env.NODE_ENV === "production";

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge:
        Number(process.env.COOKIE_EXPIRES) *
        24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

export default generateToken;
