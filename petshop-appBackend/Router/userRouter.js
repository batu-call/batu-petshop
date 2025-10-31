import express from 'express'
import { AdminLogout, getAdminDetails, getAllUser, getUserDetails, Login, Logout, newAdmin, UserRegister } from '../Controller/userController.js';
import { isAdminAuthenticated, isUserAuthenticated } from '../Middlewares/Auth.js';


 const router = express.Router();


router.post("/register",UserRegister);

router.post("/login",Login);
router.post("/logout",isUserAuthenticated,Logout);

router.post("/admin/add",isAdminAuthenticated,newAdmin);
router.get("/admin/me",isAdminAuthenticated,getAdminDetails)
router.post("/admin/logout",isAdminAuthenticated,AdminLogout);

router.get("/users",isAdminAuthenticated,getAllUser);
router.get("/users/:id",isAdminAuthenticated,getUserDetails);



export default router;