import express from 'express'
import { newAdmin, getAdminDetails, AdminLogout, getAllUser, getUserDetails, adminLogin } from '../Controller/userController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import { User } from '../Models/userSchema.js';
import ErrorHandler from '../Middlewares/errorMiddleware.js';

const router = express.Router();


router.post("/add", async (req, res, next) => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount > 0) {
      return isAdminAuthenticated(req, res, async () => {
        if (!req.files || !req.files.avatar)
          return next(new ErrorHandler("Avatar is required!", 400));

        await newAdmin(req, res, next);
      });
    }

    if (!req.files || !req.files.avatar)
      return next(new ErrorHandler("Avatar is required!", 400));

    await newAdmin(req, res, next);
  } catch (error) {
    next(error);
  }
});



router.post("/login",adminLogin)
router.get("/me", isAdminAuthenticated, getAdminDetails);
router.post("/logout", isAdminAuthenticated, AdminLogout);
router.get("/users", isAdminAuthenticated, getAllUser);
router.get("/users/:id", isAdminAuthenticated, getUserDetails);

export default router;