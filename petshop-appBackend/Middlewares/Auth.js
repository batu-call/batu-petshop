import { catchAsyncError } from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddleware.js";
import { User } from "../Models/userSchema.js";

export const isAdminAuthenticated = catchAsyncError(async (req, res, next) => {
  let token = req.cookies.AdminToken;
  
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("🔐 [Admin Auth] Token from Authorization header");
  }

  if (!token) {
    console.log("❌ [Admin Auth] No token found");
    return next(new ErrorHandler("Admin not authenticated", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    console.log("❌ [Admin Auth] Token verification failed:", error.message);
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    console.log("❌ [Admin Auth] User not found");
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role !== "Admin") {
    console.log("❌ [Admin Auth] Role mismatch:", user.role);
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
    console.log("🔐 [User Auth] Token from Authorization header (mobile)");
  }

  if (!token) {
    console.log("❌ [User Auth] No token found");
    console.log("Cookies:", Object.keys(req.cookies));
    console.log("Authorization:", req.headers.authorization);
    return next(new ErrorHandler("User not authenticated", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    console.log("❌ [User Auth] Token verification failed:", error.message);
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    console.log("❌ [User Auth] User not found");
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role !== "User") {
    console.log("❌ [User Auth] Role mismatch:", user.role);
    return next(
      new ErrorHandler(`${user.role} not authorized for this resource!`, 403)
    );
  }

  console.log("✅ [User Auth] Authenticated:", user.email);
  req.user = user;
  next();
});