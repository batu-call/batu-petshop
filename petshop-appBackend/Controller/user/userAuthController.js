import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { LoginActivity } from "../../Models/LoginActivitySchema.js";
import { Session } from "../../Models/sessionSchema.js";
import { User } from "../../Models/userSchema.js";
import generateToken from "../../utils/jwt.js";
import { getClearCookieOptions } from "../../utils/cookieHelper.js";
import { v2 as cloudinary } from "cloudinary";
import { sendAutoMail } from "../mailController.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  validatePassword,
  validateRequiredFields,
} from "../../utils/securityHelper.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Google token verification failed:", error);
    throw new Error("Invalid Google token");
  }
};

const saveLoginActivity = (userId, ipAddress, userAgent) => {
  Promise.all([
    LoginActivity.create({
      userId,
      ipAddress: sanitizeString(ipAddress),
      userAgent: sanitizeString(userAgent),
    }),
    Session.find({ userId })
      .sort({ startedAt: -1 })
      .then(async (sessions) => {
        if (sessions.length >= 5) {
          const oldIds = sessions.slice(4).map((s) => s._id);
          await Session.deleteMany({ _id: { $in: oldIds } });
        }
        await Session.create({
          userId,
          startedAt: new Date(),
          ipAddress: sanitizeString(ipAddress),
          userAgent: sanitizeString(userAgent),
        });
      }),
  ]).catch((err) => console.error("Login activity error:", err.message));
};

const closeUserSessions = async (userId) => {
  try {
    const now = new Date();
    const openSessions = await Session.find({ userId, endedAt: null });
    for (const session of openSessions) {
      session.endedAt = now;
      session.duration = now.getTime() - session.startedAt.getTime();
      await session.save();
    }
  } catch (err) {
    console.error("Session close error:", err.message);
  }
};

export const UserRegister = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    validateRequiredFields(req.body, [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
    ]);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  const sanitizedFirstName = sanitizeString(firstName);
  const sanitizedLastName = sanitizeString(lastName);

  let sanitizedPhone;
  try {
    sanitizedPhone = sanitizePhone(phone);
  } catch (error) {
    return next(new ErrorHandler("Invalid phone number", 400));
  }

  try {
    validatePassword(password, 6);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  const userExists = await User.findOne({ email: sanitizedEmail });
  if (userExists)
    return next(new ErrorHandler("User Already Registered!", 400));

  let avatarUrl =
    "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg";
  if (req.file) {
    try {
      avatarUrl = await uploadBufferToCloudinary(req.file.buffer, "avatars");
    } catch (error) {
      return next(new ErrorHandler("Failed to upload avatar", 500));
    }
  }

  const user = await User.create({
    firstName: sanitizedFirstName,
    lastName: sanitizedLastName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    password,
    role: "User",
    avatar: avatarUrl,
  });

  sendAutoMail({
    to: user.email,
    subject: "Welcome to Petshop 🐾",
    html: `<h3>Welcome ${sanitizeString(user.firstName)}!</h3><p>Your account has been created successfully.</p>`,
  }).catch((err) => console.error("Welcome mail failed:", err.message));

  generateToken(user, "User Registered Successfully!", 200, res);
});

export const Login = catchAsyncError(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please Fill Full Form!", 400));

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  const user = await User.findOne({ email: sanitizedEmail }).select(
    "+password",
  );
  if (!user) return next(new ErrorHandler("Invalid Password Or Email!", 400));

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch)
    return next(new ErrorHandler("Invalid Password Or Email!", 400));

  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "Unknown";

  saveLoginActivity(user._id, ipAddress, userAgent);

  generateToken(user, "User Logged Successfully!", 200, res, !!rememberMe);
});

export const googleLogin = catchAsyncError(async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) return next(new ErrorHandler("Google token missing", 400));

  let payload;
  try {
    payload = await verifyGoogleToken(idToken);
  } catch (error) {
    return next(new ErrorHandler("Invalid Google token", 401));
  }

  const { email, name, picture } = payload;
  if (!email)
    return next(new ErrorHandler("Email not found in Google token", 400));

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return next(new ErrorHandler("Invalid email from Google", 400));
  }

  let user = await User.findOne({ email: sanitizedEmail });

  if (!user) {
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ") || "";

    user = await User.create({
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      email: sanitizedEmail,
      phone: "",
      password: crypto.randomBytes(32).toString("hex"),
      role: "User",
      avatar:
        picture ||
        "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg",
      authProvider: "google",
    });

    sendAutoMail({
      to: user.email,
      subject: "Welcome to Petshop 🐾",
      html: `<h3>Welcome ${sanitizeString(user.firstName)}!</h3><p>Your account has been created successfully via Google.</p>`,
    }).catch((err) => console.error("Welcome mail failed:", err.message));
  }

  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "Unknown";

  saveLoginActivity(user._id, ipAddress, userAgent);

  generateToken(user, "Google login successful", 200, res);
});

export const Logout = catchAsyncError(async (req, res, next) => {
  if (req.user?._id) {
    await closeUserSessions(req.user._id);
  }

  res
    .status(200)
    .cookie("UserToken", "", getClearCookieOptions())
    .json({ success: true, message: "User Logged Out Successfully!" });
});
