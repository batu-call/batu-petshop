import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { LoginActivity } from "../Models/LoginActivitySchema.js";
import { Session } from "../Models/sessionSchema.js";
import { User } from "../Models/userSchema.js";
import generateToken from "../utils/jwt.js";
import cloudinary from "cloudinary";

export const UserRegister = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, address, role } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !address ||
    !role
  ) {
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
    address,
    role,
    avatar: avatarUrl,
  });

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
    return next(new ErrorHandler("Invalide Password Or Email!", 400));
  }
  await LoginActivity.create({ userId: user._id });
  await Session.create({ userId: user._id, startedAt: new Date() });

  generateToken(user, "User Logged Successfully!", 200, res);
});

export const Logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("UserToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Logout Out Successfully!",
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

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} With This Email Already Exists!`,
        400
      )
    );
  }

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

  res.status(201).json({
    success: true,
    message: "New Admin Register!",
    admin,
  });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "Admin" }).select(
    "+password"
  );
  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  // Compare password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Incorrect password", 401));
  await LoginActivity.create({ userId: admin._id });
  await Session.create({ userId: admin._id, startedAt: new Date() });

  // Generate JWT token
  const token = admin.generateJsonWebToken();

  res.cookie("AdminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
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
    .cookie("AdminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logout Out Successfully!",
    });
});

export const getAllUser = catchAsyncError(async (req, res, next) => {
  const getUser = await User.find({ role: "User" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: getUser.length,
    getUser,
  });
});

export const getUserDetails = catchAsyncError(async (req, res, next) => {
 const user = await User.findById(req.params.id);
 if(!user){
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
  const adminDetails = await User.find({ role: "Admin" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: adminDetails.length,
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

  await user.deleteOne();

  res.status(200).json({
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

  if (firstName) {
    user.firstName = firstName;
  }
  if (lastName) {
    user.lastName = lastName;
  }
  if (email) {
    user.email = email;
  }
  if (phone) {
    user.phone = phone;
  }
  if (password) {
    user.password = password;
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
    user,
  });
});
