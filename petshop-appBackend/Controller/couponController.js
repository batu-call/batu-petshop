import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { Cart } from "../Models/CartSchema.js";
import Coupon from "../Models/couponSchema.js";

export const createCoupon = catchAsyncError(async (req, res, next) => {
  const code = req.body.code?.trim().toUpperCase();

  if (!code) {
    return next(new ErrorHandler("Coupon code is required", 400));
  }

  const exists = await Coupon.findOne({ code });
  if (exists) {
    return next(new ErrorHandler("Coupon already exists", 400));
  }

  const coupon = await Coupon.create({
    ...req.body,
    code,
  });

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
  if (req.body.code) {
    req.body.code = req.body.code.trim().toUpperCase();

    const exists = await Coupon.findOne({
      code: req.body.code,
      _id: { $ne: req.params.id },
    });

    if (exists) {
      return next(new ErrorHandler("Coupon code already exists", 400));
    }
  }

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
  const { code } = req.body;

  if (!code) {
    return next(new ErrorHandler("Coupon code is required", 400));
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    status: true,
  });

  if (!coupon) {
    return next(new ErrorHandler("Invalid or expired coupon", 400));
  }

  
  if (coupon.percent <= 0 || coupon.percent > 100) {
    return next(new ErrorHandler("Invalid coupon percent", 400));
  }

  const now = new Date();

  if (coupon.validFrom && now < coupon.validFrom) {
    return next(new ErrorHandler("Coupon not active yet", 400));
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    return next(new ErrorHandler("Coupon expired", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler("Cart is empty", 400));
  }

  const subTotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (coupon.minAmount && subTotal < coupon.minAmount) {
    return next(
      new ErrorHandler(
        `Minimum order amount is $${coupon.minAmount}`,
        400
      )
    );
  }

  if (cart.appliedCoupon?.code === coupon.code) {
    return next(new ErrorHandler("Coupon already applied", 400));
  }

  let discountAmount = Math.round(
    (subTotal * coupon.percent) / 100
  );

  cart.appliedCoupon = {
    code: coupon.code,
    percent: coupon.percent,
    discountAmount,
  };

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    cart,
  });
});