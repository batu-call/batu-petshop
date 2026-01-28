import express from 'express'
import { newAdmin, getAdminDetails, AdminLogout, getAllUser, getUserDetails, adminLogin, getAdmin, deleteAdmin } from '../Controller/userController.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import { User } from '../Models/userSchema.js';
import ErrorHandler from '../Middlewares/errorMiddleware.js';
import upload from '../Config/multer.js';

const router = express.Router();


router.post(
  "/add",
  isAdminAuthenticated,
  upload.single("avatar"),
  newAdmin
);

router.post("/login",adminLogin)
router.get("/me", isAdminAuthenticated, getAdmin);
router.delete("/:id", isAdminAuthenticated, deleteAdmin);
router.get("/details", isAdminAuthenticated, getAdminDetails);
router.get("/logout", isAdminAuthenticated, AdminLogout);

export default router;