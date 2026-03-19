import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { Session } from "../../Models/sessionSchema.js";
import { User } from "../../Models/userSchema.js";
import { getClearCookieOptions } from "../../utils/cookieHelper.js";
import cloudinary from "cloudinary";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeObjectId,
  sanitizePhone,
  buildSafeSortOptions,
  buildSafePagination,
  createSafeRegex,
  validatePassword,
} from "../../utils/securityHelper.js";

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "firstName",
  "lastName",
  "email",
  "orderCount",
];

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

  const { page: safePage, limit, skip } = buildSafePagination(page, 15);
  const sortOptions = buildSafeSortOptions(
    sortBy,
    sortOrder,
    ALLOWED_SORT_FIELDS,
  );

  let matchStage = { role: "User" };

  if (search && typeof search === "string") {
    const regex = createSafeRegex(search, 50);
    if (regex) {
      matchStage.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }
  }

  const validRoles = ["User", "Admin"];
  if (role && validRoles.includes(role)) matchStage.role = role;

  const totalAllUsers = await User.countDocuments({ role: "User" });

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
    if (minOrders) {
      const min = parseInt(minOrders);
      if (!isNaN(min) && min >= 0) orderFilter.$gte = min;
    }
    if (maxOrders) {
      const max = parseInt(maxOrders);
      if (!isNaN(max) && max >= 0) orderFilter.$lte = max;
    }
    if (Object.keys(orderFilter).length > 0) {
      pipeline.push({ $match: { orderCount: orderFilter } });
    }
  }

  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await User.aggregate(countPipeline);
  const filteredUsers = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push({ $sort: sortOptions });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  pipeline.push({
    $project: {
      password: 0,
      orders: 0,
      resetPasswordToken: 0,
      resetPasswordExpire: 0,
    },
  });

  const users = await User.aggregate(pipeline);

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(filteredUsers / limit),
    totalUsers: totalAllUsers,
    filteredUsers,
    currentPage: safePage,
    users,
  });
});

export const getUserDetails = catchAsyncError(async (req, res, next) => {
  let userId;
  try {
    userId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid user ID", 400));
  }

  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpire",
  );
  if (!user) return next(new ErrorHandler("User not found!", 404));

  if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
    return next(new ErrorHandler("Not authorized to view this user", 403));
  }

  res.status(200).json({ success: true, user });
});

export const getUserMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "-password -resetPasswordToken -resetPasswordExpire",
  );
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  res.status(200).json({ success: true, user });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user?._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { firstName, lastName, email, phone, password } = req.body;

  if (firstName) user.firstName = sanitizeString(firstName);
  if (lastName) user.lastName = sanitizeString(lastName);

  if (email) {
    try {
      user.email = sanitizeEmail(email);
    } catch (error) {
      return next(new ErrorHandler("Invalid email format", 400));
    }
  }

  if (phone) {
    try {
      user.phone = sanitizePhone(phone);
    } catch (error) {
      return next(new ErrorHandler("Invalid phone number", 400));
    }
  }

  if (password) {
    try {
      validatePassword(password, 6);
      user.password = password;
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

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
    user: {
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
    },
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  let userId;
  try {
    userId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid user ID", 400));
  }

  const user = await User.findById(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
    return next(new ErrorHandler("Not authorized to delete this user", 403));
  }

  await Session.updateMany(
    { userId: user._id, endedAt: null },
    { endedAt: new Date() },
  );
  await user.deleteOne();

  const clearOptions = getClearCookieOptions();
  res
    .status(200)
    .cookie("UserToken", "", clearOptions)
    .cookie("next-auth.session-token", "", { ...clearOptions, path: "/" })
    .cookie("next-auth.csrf-token", "", { ...clearOptions, path: "/" })
    .json({ success: true, message: "User deleted successfully" });
});

export const deleteUserSelf = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await Session.updateMany(
    { userId: user._id, endedAt: null },
    { endedAt: new Date() },
  );
  await user.deleteOne();

  const clearOptions = getClearCookieOptions();
  res
    .status(200)
    .cookie("UserToken", "", clearOptions)
    .cookie("next-auth.session-token", "", { ...clearOptions, path: "/" })
    .cookie("next-auth.csrf-token", "", { ...clearOptions, path: "/" })
    .json({ success: true, message: "Account deleted successfully" });
});
