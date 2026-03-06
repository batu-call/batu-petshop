import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { LoginActivity } from "../../Models/LoginActivitySchema.js";
import { Session } from "../../Models/sessionSchema.js";
import { User } from "../../Models/userSchema.js";
import { getClearCookieOptions, getCookieOptions } from "../../utils/cookieHelper.js";
import { v2 as cloudinary } from "cloudinary";
import { sendAutoMail } from "../mailController.js";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeObjectId,
  sanitizePhone,
  buildSafeSortOptions,
  buildSafePagination,
  createSafeRegex,
  validateRequiredFields,
} from "../../utils/securityHelper.js";

const ALLOWED_SORT_FIELDS = ["createdAt", "firstName", "lastName", "email", "orderCount"];

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

export const newAdmin = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, address } = req.body;

  try {
    validateRequiredFields(req.body, ["firstName", "lastName", "email", "phone", "password", "address"]);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  const userExists = await User.findOne({ email: sanitizedEmail });
  if (userExists) return next(new ErrorHandler("User Already Registered!", 400));

  let avatarUrl = "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg";
  if (req.file) {
    try {
      avatarUrl = await uploadBufferToCloudinary(req.file.buffer, "admins");
    } catch (error) {
      return next(new ErrorHandler("Failed to upload admin avatar", 500));
    }
  }

  const admin = await User.create({
    firstName: sanitizeString(firstName),
    lastName: sanitizeString(lastName),
    email: sanitizedEmail,
    phone: sanitizePhone(phone),
    password,
    address: sanitizeString(address),
    avatar: avatarUrl,
    role: "Admin",
  });

  sendAutoMail({
    to: admin.email,
    subject: "Admin Account Created",
    html: `<p>You have been added as an admin.</p>`,
  }).catch((err) => console.error("Admin mail failed:", err.message));

  res.status(201).json({ success: true, message: "New Admin Registered!", admin });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  let sanitizedEmail;
  try {
    sanitizedEmail = sanitizeEmail(email);
  } catch (error) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  const admin = await User.findOne({ email: sanitizedEmail, role: "Admin" }).select("+password");
  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Incorrect password", 401));

  const token = admin.generateJsonWebToken();

  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "Unknown";

  Promise.all([
    LoginActivity.create({
      userId: admin._id,
      ipAddress: sanitizeString(ipAddress),
      userAgent: sanitizeString(userAgent),
    }),
    Session.create({
      userId: admin._id,
      startedAt: new Date(),
      ipAddress: sanitizeString(ipAddress),
      userAgent: sanitizeString(userAgent),
    }),
  ]).catch((err) => console.error("Admin login activity error:", err.message));

  res.cookie("AdminToken", token, getCookieOptions()).status(200).json({
    success: true,
    message: "Admin login successful",
    admin: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      avatar: admin.avatar,
    },
  });
});

export const AdminLogout = catchAsyncError(async (req, res, next) => {
  const session = await Session.findOne({ userId: req.user._id, endedAt: null }).sort({ startedAt: -1 });

  if (session) {
    session.endedAt = new Date();
    session.duration = session.endedAt.getTime() - session.startedAt.getTime();
    await session.save();
  }

  res.status(200).cookie("AdminToken", "", getClearCookieOptions()).json({
    success: true,
    message: "Admin Logged Out Successfully!",
  });
});

export const getAdmin = catchAsyncError(async (req, res, next) => {
  const admin = await User.findById(req.user.id).select("-password");
  res.status(200).json({ success: true, admin });
});

export const getAdminDetails = catchAsyncError(async (req, res, next) => {
  const { page = 1, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const { page: safePage, limit, skip } = buildSafePagination(page, 15);
  const sortOptions = buildSafeSortOptions(sortBy, sortOrder, ALLOWED_SORT_FIELDS);
  const totalAllAdmins = await User.countDocuments({ role: "Admin" });

  let filter = { role: "Admin" };

  if (search && typeof search === "string") {
    const regex = createSafeRegex(search, 50);
    if (regex) {
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { address: regex },
        { phone: regex },
      ];
    }
  }

  const filteredAdmins = await User.countDocuments(filter);
  const adminDetails = await User.find(filter).select("-password").sort(sortOptions).skip(skip).limit(limit);

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(filteredAdmins / limit),
    totalAdmins: totalAllAdmins,
    filteredAdmins,
    currentPage: safePage,
    adminDetails,
  });
});

export const deleteAdmin = catchAsyncError(async (req, res, next) => {
  let adminId;
  try {
    adminId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid admin ID", 400));
  }

  const admin = await User.findById(adminId);
  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  await admin.deleteOne();
  res.status(200).json({ success: true, message: "Admin deleted successfully" });
});