import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import Coupon from "../Models/couponSchema.js";

export const createCoupon = catchAsyncError(async (req, res, next) => {
  const coupon = new Coupon(req.body);
  await coupon.save();
  res.status(201).json({
    success: true,
    data: coupon,
  });
});

export const getCoupons = catchAsyncError(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

export const getCouponById = catchAsyncError(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }
  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const updateCoupon = catchAsyncError(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }
  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const deleteCoupon = catchAsyncError(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Coupon deleted",
  });
});

export const applyCoupon = catchAsyncError(async (req, res, next) => {
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    status: true,
  });

  if (!coupon) {
    return next(new ErrorHandler("Invalid or expired coupon", 400));
  }
  if (coupon.minAmount > subtotal) {
    return next(
      new ErrorHandler(`Minimum order amount is $${coupon.minAmount}`, 400)
    );
  }

  const discountAmount = (subtotal * coupon.percent) / 100;
  res.status(200).json({
    success: true,
    discountAmount,
    percent: coupon.percent,
  });
});
