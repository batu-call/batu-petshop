import { catchAsyncError } from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddleware.js";
import { User } from "../Models/userSchema.js";

export const isAdminAuthenticated = catchAsyncError(async (req, res, next) => {
  let token = req.cookies.AdminToken;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler("Admin not authenticated", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role !== "Admin") {
    return next(
      new ErrorHandler(`${user.role} not authorized for this resource!`, 403)
    );
  }

  req.user = user;
  next();
});

export const isUserAuthenticated = catchAsyncError(async (req, res, next) => {
  let token = req.cookies.UserToken;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return res
      .status(401)
      .cookie("UserToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0),
      })
      .cookie("next-auth.session-token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0),
        path: "/",
      })
      .cookie("next-auth.csrf-token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0),
        path: "/",
      })
      .json({
        success: false,
        message: "User account has been deleted",
        accountDeleted: true,
      });
  }

  if (user.role !== "User") {
    return next(
      new ErrorHandler(`${user.role} not authorized for this resource!`, 403)
    );
  }

  req.user = user;
  next();
});
