import express from 'express';
import { newAdmin, getAdminDetails, AdminLogout, getAllUser, getUserDetails, adminLogin, getAdmin, deleteAdmin } from '../Controller/user/index.js';
import { isAdminAuthenticated } from '../Middlewares/Auth.js';
import upload, { handleMulterError } from '../Config/multer.js';
import { loginLimiter, adminActionLimiter } from '../Middlewares/Ratelimiter.js';

const router = express.Router();


router.post("/login", loginLimiter, adminLogin);


router.post(
  "/add",
  isAdminAuthenticated,
  adminActionLimiter,
  upload.single("avatar"),
  handleMulterError,
  newAdmin
);
router.delete("/:id", isAdminAuthenticated, adminActionLimiter, deleteAdmin);

router.get("/me", isAdminAuthenticated, getAdmin);
router.get("/details", isAdminAuthenticated, getAdminDetails);
router.get("/logout", isAdminAuthenticated, AdminLogout);


export default router;