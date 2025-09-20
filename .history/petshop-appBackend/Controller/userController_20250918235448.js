import {catchAsyncError} from '../Middlewares/catchAsyncError.js'
import ErrorHandler from '../Middlewares/errorMiddleware.js'
import { User } from '../Models/userSchema.js'
import generateToken from '../utils/jwt.js'
import { validateFields } from '../utils/validateFields.js';
import bcrypt from 'bcrypt'


    export const UserRegister = catchAsyncError(async(req,res,next) => {
        const { firstName,lastName,email,phone,password,address,avatar,role} = req.body;

        if(
            !firstName ||
            !lastName || 
            !email ||
            !phone ||
            !password ||
            !address ||
            !avatar ||
            !role
        ) {
            return next(new ErrorHandler("Please Fill Full Form!",400))
        }

        let user = await User.findOne({email})
        if(user){
            return next(new ErrorHandler("User Already Register!",400))
        }

        user = await User.create({
            firstName,lastName,email,phone,password,address,avatar,role
        });

        generateToken(user,"User Register!",200,res);
    });
    


    export const Login = catchAsyncError(async(req,res,next) => {
        const  {email,password} = req.body;

        if(
            !email ||
            !password
        )
        {
            return next(new ErrorHandler("Please Fill Full Form!",400))
        }

        const user = await User.findOne({email}).select("+password");

        if(!user){
           return next(new ErrorHandler("Invalid Password Or Email!",400)) 
        }
      
        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalide Password Or Email!",400))
        }
        generateToken(user,"User Logged Successfully!",200,res)
    });

   
    export const Logout =  catchAsyncError(async(req,res,next)=>{
        res.status(200).cookie("UserToken","",{
            httpOnly:true,
            expires:new Date(Date.now()),
        }).json({
            success:true,
            message:"User Logout Out Successfully!"
        })
    });


    export const newAdmin = catchAsyncError(async(req,res,next)=>{
        
        const {firstName,lastName,email,phone,password,address,avatar,role} = req.body;

        const errorValidate =  validateFields({ firstName,lastName,email,phone,password,address,avatar,role});
        if(errorValidate) return next(errorValidate);

        const isRegistered = await User.findOne({email});
        if(isRegistered){
            return next(new ErrorHandler(`${isRegistered.role} With This Email Already Exists!`,400))
        }

        const admin = await User.create({
            firstName,
            lastName, 
            email, 
            phone,
            password, 
            address, 
            avatar:"https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg", 
            role:"Admin",
        })

        res.status(201).json({
            success: true,
            message:"New Admin Register!",
            admin
        })
    })



  export const adminLogin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    // Find admin
    const admin = await User.findOne({ email, role: 'Admin' });
    if (!admin) return next(new ErrorHandler("Admin not found", 404));

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("Incorrect password", 401));

    // Generate JWT token with schema method
    const token = admin.generateJsonWebToken();

    // Set token in cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        success: true,
        message: "Admin login successful",
        admin: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email
        }
    });
});

    export const AdminLogout = catchAsyncError(async(req,res,next) => {
        res.status(200).cookie("AdminToken","" , {
            httpOnly:true,
            expires: new Date(Date.now())
        })
        .json({
            success:true,
            message:"Admin Logout Out Successfully!"
        })
    })

    export const getAllUser = catchAsyncError(async(req,res,next)=>{
        const getUser = await User.find({role:"User"})

        res.status(200).json({
            success:true,
            getUser
        })
    })

    export const getUserDetails = catchAsyncError(async(req,res,next) => {

        res.status(200).json({
            success:true,
            count : req.user.length,
            user:req.user
        })
    })

    export const getAdminDetails = catchAsyncError(async(req,res,next) => {
        const adminDetails = await User.find({role:"Admin"}).select("-password");

        res.status(200).json({
            success:true,
            count : adminDetails.length,
            adminDetails
        })
    })






