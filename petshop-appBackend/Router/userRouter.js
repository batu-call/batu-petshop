import express from 'express'
import { UserRegister, Login, Logout } from '../Controller/userController.js';
import { isUserAuthenticated } from '../Middlewares/Auth.js';

const router = express.Router();

router.post("/register", UserRegister);
router.post("/login", Login);
router.post("/logout", isUserAuthenticated, Logout);

export default router;