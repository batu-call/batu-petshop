import { catchAsyncError } from "./catchAsyncError.js";
import jwt from 'jsonwebtoken'
import ErrorHandler from "./errorMiddleware.js";
import {User} from '../Models/userSchema.js'

    export const isAdminAuthenticated = catchAsyncError(async (req,res,next)=>{
        const token = req.cookies.AdminToken;
        
        if(!token) {
            return (
                next(new ErrorHandler("Admin Not Authenticated",401))
            )
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        
        req.user = await User.findById(decoded.id);
        
        if(req.user.role !== "Admin"){
            return next(new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403));
        }
        next();
    }) ;


export const isUserAuthenticated = catchAsyncError(async(req,res,next)=> {
    const token = req.cookies.UserToken;

    if(!token){
        return next(new ErrorHandler("User Not Authenticated",401));
    }
    
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    
    req.user = await User.findById(decoded.id);
    
    if(req.user.role !== "User"){
        return next(new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403));
    }
     next();
})