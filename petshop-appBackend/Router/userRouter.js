import express from 'express'
import { AdminLogout, deleteUser, getAdminDetails, getAllUser, getUserDetails, getUserMe, Login, Logout, newAdmin, UserRegister, updateUser } from '../Controller/userController.js';
import { isAdminAuthenticated, isUserAuthenticated } from '../Middlewares/Auth.js';
import upload from "../Config/multer.js"

 const router = express.Router();


router.post("/register",upload.single("uploads"),UserRegister);

router.post("/login",Login);
router.post("/logout",isUserAuthenticated,Logout);

router.post("/admin/add",isAdminAuthenticated,newAdmin);
router.get("/admin/me",isAdminAuthenticated,getAdminDetails)
router.post("/admin/logout",isAdminAuthenticated,AdminLogout);

router.get("/users/me",isUserAuthenticated,getUserMe)
router.get("/users",isAdminAuthenticated,getAllUser);
router.get("/users/:id",isAdminAuthenticated,getUserDetails);
router.delete('/:id', isAdminAuthenticated, deleteUser);
router.put("/update", isUserAuthenticated, upload.single("avatar"), updateUser);



export default router;