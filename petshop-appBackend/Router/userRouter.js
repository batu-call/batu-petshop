import express from 'express'
import {
  deleteUser,
  getAdminDetails,
  getAllUser,
  getUserDetails,
  getUserMe,
  Login,
  Logout,
  newAdmin,
  UserRegister,
  updateUser,
  updatePassword,
  resetPassword,
  forgotPassword,
  googleLogin,
  getNotificationSettings,
  updateNotificationSettings,
  deleteUserSelf
} from '../Controller/user/index.js';
import { isAdminAuthenticated, isUserAuthenticated } from '../Middlewares/Auth.js';
import upload, { handleMulterError } from "../Config/multer.js"
import { googleLoginLimiter, loginLimiter, passwordResetLimiter, registerLimiter, userUpdateLimiter } from '../Middlewares/Ratelimiter.js';


const router = express.Router();

// Authentication Routes
router.post("/register", registerLimiter, upload.single("uploads"), handleMulterError, UserRegister);
router.post("/login", loginLimiter, Login);
router.post("/google-login", googleLoginLimiter, googleLogin);
router.post("/logout", isUserAuthenticated, Logout);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.put("/reset-password/:token", passwordResetLimiter, resetPassword);

// User Profile Routes
router.get("/users/me", isUserAuthenticated, getUserMe);
router.get("/users", isAdminAuthenticated, getAllUser);
router.get("/users/:id", isAdminAuthenticated, getUserDetails);
// User Delete
router.delete('/admin/:id', isAdminAuthenticated, deleteUser);
router.delete('/:id', isUserAuthenticated, deleteUserSelf);
//put
router.put("/update", isUserAuthenticated, upload.single("avatar"), handleMulterError,userUpdateLimiter, updateUser);
router.put("/update-password", isUserAuthenticated, userUpdateLimiter,updatePassword);

//  Notification Settings Routes
router.get("/notification-settings", isUserAuthenticated, getNotificationSettings);
router.put("/notification-settings", isUserAuthenticated, userUpdateLimiter, updateNotificationSettings);

export default router;