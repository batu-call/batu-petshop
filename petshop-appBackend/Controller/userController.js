import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { LoginActivity } from "../Models/LoginActivitySchema.js";
import { Session } from "../Models/sessionSchema.js";
import { User } from "../Models/userSchema.js";
import generateToken from "../utils/jwt.js";
import { getClearCookieOptions, getCookieOptions } from "../utils/cookieHelper.js";
import cloudinary from "cloudinary";
import { sendAutoMail } from "./mailController.js";
import crypto from "crypto";

export const UserRegister = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists)
    return next(new ErrorHandler("User Already Registered!", 400));

  let avatarUrl =
    "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg";

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });
    avatarUrl = result.secure_url;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    avatar: avatarUrl,
  });
  
  try {
    await sendAutoMail({
      to: user.email,
      subject: "Welcome to Petshop 🐾",
      html: `
      <h3>Welcome ${user.firstName}!</h3>
      <p>Your account has been created successfully.</p>
    `,
    });
  } catch (err) {
    console.error("Welcome mail failed:", err.message);
  }

  generateToken(user, "User Registered Successfully!", 200, res);
});

export const Login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Password Or Email!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Password Or Email!", 400));
  }
  
  await LoginActivity.create({ userId: user._id });
  await Session.create({ userId: user._id, startedAt: new Date() });

  generateToken(user, "User Logged Successfully!", 200, res);
});

export const googleLogin = catchAsyncError(async (req, res, next) => {
  const { email, name, image } = req.body;

  if (!email || !name) {
    return next(new ErrorHandler("Google authentication data missing", 400));
  }

  let user = await User.findOne({ email });

  if (!user) {
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ") || "";

    user = await User.create({
      firstName,
      lastName,
      email,
      phone: "",
      password: crypto.randomBytes(32).toString("hex"),
      role: "User",
      avatar: image || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg",
      authProvider: "google",
    });

    try {
      await sendAutoMail({
        to: user.email,
        subject: "Welcome to Petshop 🐾",
        html: `
          <h3>Welcome ${user.firstName}!</h3>
          <p>Your account has been created successfully via Google.</p>
        `,
      });
    } catch (err) {
      console.error("Welcome mail failed:", err.message);
    }
  }

  await LoginActivity.create({ userId: user._id });
  await Session.create({ userId: user._id, startedAt: new Date() });

  generateToken(user, "Google login successful", 200, res);
});

export const Logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("UserToken", "", getClearCookieOptions())
    .json({
      success: true,
      message: "User Logged Out Successfully!",
    });
});

export const newAdmin = catchAsyncError(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    role = "Admin",
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !address) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists)
    return next(new ErrorHandler("User Already Registered!", 400));

  let avatarUrl =
    "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg";

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });
    avatarUrl = result.secure_url;
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    avatar: avatarUrl,
    role: "Admin",
  });
  
  try {
    await sendAutoMail({
      to: admin.email,
      subject: "Admin Account Created",
      html: `<p>You have been added as an admin.</p>`,
    });
  } catch (err) {
    console.error("Admin mail failed");
  }

  res.status(201).json({
    success: true,
    message: "New Admin Registered!",
    admin,
  });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "Admin" }).select("+password");
  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Incorrect password", 401));

  await LoginActivity.create({ userId: admin._id });
  await Session.create({ userId: admin._id, startedAt: new Date() });

  const token = admin.generateJsonWebToken();

  res
    .cookie("AdminToken", token, getCookieOptions())
    .status(200)
    .json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
    });
});

export const AdminLogout = catchAsyncError(async (req, res, next) => {
  const session = await Session.findOne({
    userId: req.user._id,
    endedAt: null,
  }).sort({ startedAt: -1 });

  if (session) {
    session.endedAt = new Date();
    session.duration = session.endedAt.getTime() - session.startedAt.getTime();
    await session.save();
  }

  res
    .status(200)
    .cookie("AdminToken", "", getClearCookieOptions())
    .json({
      success: true,
      message: "Admin Logged Out Successfully!",
    });
});

export const getAllUser = catchAsyncError(async (req, res, next) => {
  const {
    page = 1,
    search,
    role,
    minOrders,
    maxOrders,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const limit = 15;
  const skip = (Number(page) - 1) * limit;

  let matchStage = { role: "User" };

  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (search && typeof search === "string") {
    const safeSearch = escapeRegex(search.trim().slice(0, 50));

    matchStage.$or = [
      { firstName: { $regex: safeSearch, $options: "i" } },
      { lastName: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { phone: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (role) {
    matchStage.role = role;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "orders",
      },
    },
    {
      $addFields: {
        orderCount: { $size: "$orders" },
        lastOrderAt: { $max: "$orders.createdAt" },
      },
    },
  ];

  if (minOrders || maxOrders) {
    const orderFilter = {};
    if (minOrders) orderFilter.$gte = Number(minOrders);
    if (maxOrders) orderFilter.$lte = Number(maxOrders);

    pipeline.push({
      $match: { orderCount: orderFilter },
    });
  }

  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await User.aggregate(countPipeline);
  const totalUsers = countResult.length > 0 ? countResult[0].total : 0;

  const sortStage = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  pipeline.push({
    $project: {
      password: 0,
      orders: 0,
    },
  });

  const users = await User.aggregate(pipeline);

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(totalUsers / limit),
    totalUsers,
    currentPage: Number(page),
    users,
  });
});

export const getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found!", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const getUserMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const getAdminDetails = catchAsyncError(async (req, res, next) => {
  const {
    page = 1,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const limit = 15;
  const skip = (Number(page) - 1) * limit;

  let filter = { role: "Admin" };

  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (search && typeof search === "string") {
    const safeSearch = escapeRegex(search.trim().slice(0, 50));

    filter.$or = [
      { firstName: { $regex: safeSearch, $options: "i" } },
      { lastName: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { address: { $regex: safeSearch, $options: "i" } },
      { phone: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const totalAdmins = await User.countDocuments(filter);

  const sortObj = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

  const adminDetails = await User.find(filter)
    .select("-password")
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(totalAdmins / limit),
    totalAdmins,
    currentPage: Number(page),
    adminDetails,
  });
});

export const getAdmin = catchAsyncError(async (req, res, next) => {
  const admin = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    admin,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await Session.updateMany(
    { userId: user._id, endedAt: null },
    { endedAt: new Date() }
  );

  await user.deleteOne();

  const clearOptions = getClearCookieOptions();

  res
    .status(200)
    .cookie("UserToken", "", clearOptions)
    .cookie("next-auth.session-token", "", {
      ...clearOptions,
      path: "/",
    })
    .cookie("next-auth.csrf-token", "", {
      ...clearOptions,
      path: "/",
    })
    .json({
      success: true,
      message: "User deleted successfully",
    });
});

export const deleteAdmin = catchAsyncError(async (req, res, next) => {
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return next(new ErrorHandler("Admin not found", 404));
  }

  await admin.deleteOne();

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const { firstName, lastName, email, phone, password } = req.body;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (password) user.password = password;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });
    user.avatar = result.secure_url;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user?.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please provide old and new password", 400));
  }

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendAutoMail({
      to: user.email,
      subject: "Password Reset Request 🔐",
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset.</p>
        <p>Click the link below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
        <br/>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email could not be sent.", 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(
      new ErrorHandler("Password must be at least 6 characters.", 400)
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid or expired reset token.", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Password reset successful.", 200, res);
});