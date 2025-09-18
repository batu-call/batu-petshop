import {catchAsyncError} from '../Middlewares/catchAsyncError.js'
import ErrorHandler from '../Middlewares/errorMiddleware.js'
import { User } from '../Models/userSchema.js'
import generateToken from '../utils/jwt.js'
import cloudinary from 'cloudinary'



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
            firstName,lastName,email,phone,password,address,avatar: avatarPath,role
        });

        const avatarPath = req.file ? req.file.path : ""; 

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


export const newAdmin = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, address } = req.body;
  const role = "admin";
  
  let avatarUrl = "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg";
  if (req.files && req.files.avatar) {
    const file = req.files.avatar;
    const cloudinaryResponse = await cloudinary.uploader.upload(file.tempFilePath);
    avatarUrl = cloudinaryResponse.secure_url;
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    avatar: avatarUrl,
    role,
  });

  res.status(201).json({
    success: true,
    message: "New Admin Registered!",
    admin,
  });
});


    export const adminLogin = catchAsyncError(async(req,res,next) =>{
        const {email,password} = req.body;

        if(!email || !password){
            return next(new ErrorHandler("Please provide email and password",400))        
        }
        const admin = await User.findOne({email,role:"admin"}).select("+password")
        if(!admin){
            return next(new ErrorHandler("Invalid email or password",401));
        }
        const isPasswordMatch = await admin.comparePassword(password);
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid email or password",401));
        }
        const token = admin.generateJsonWebToken();

        res.status(200).cookie("AdminToken",token,{httpOnly:true,secure:false}).json({
            success:true,
            message:"Admin logged in successfully",
            admin
        })
    }) 

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






