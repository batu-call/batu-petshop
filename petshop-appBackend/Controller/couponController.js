import  {catchAsyncError}  from '../Middlewares/catchAsyncError.js'
import ErrorHandler from '../Middlewares/errorMiddleware.js';
import Coupon from '../Models/couponSchema.js'



    export const createCoupon = catchAsyncError(async(req,res,next)=>{
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json({
            success:true,
            data:coupon
        })
    });


    export const getCoupons = catchAsyncError(async(req,res,next)=>{
        const coupons = await Coupon.find();
        res.status(200).json({
            success:true,
            data:coupons
        }) 
    })

    export const getCouponById = catchAsyncError(async(req,res,next)=>{
        const coupon = await Coupon.findById(req.params.id);
        if(!coupon){
            return next(new ErrorHandler("Coupon not found",404))
        }
        res.status(200).json({
            success:true,
            data:coupon
        })
    });

    export const updateCoupon = catchAsyncError(async(req,res,next) =>{
        const coupon = await Coupon.findByIdAndUpdate(req.params.id,req.body,{new:true})
        if(!coupon){
            return next(new ErrorHandler("Coupon not found",404))
        }
        res.status(200).json({
            success:true,
            data:coupon
        })
    })

    export const deleteCoupon = catchAsyncError(async(req,res,next)=>{
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if(!coupon){
            return next(new ErrorHandler("Coupon not found",404))
        }
        res.status(200).json({
            success:true,
            message:"Coupon deleted"
        })
    }) 