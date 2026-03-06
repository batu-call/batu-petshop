import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { Cart } from "../Models/CartSchema.js";
import Coupon from "../Models/couponSchema.js";
import {
  sanitizeString,
  sanitizeObjectId,
  sanitizeNumber,
} from "../utils/securityHelper.js";

export const createCoupon = catchAsyncError(async (req, res, next) => {
  const code = req.body.code?.trim().toUpperCase();

  if (!code) {
    return next(new ErrorHandler("Coupon code is required", 400));
  }

  const sanitizedCode = sanitizeString(code);

  const exists = await Coupon.findOne({ code: sanitizedCode });
  if (exists) {
    return next(new ErrorHandler("Coupon already exists", 400));
  }

  const couponData = {
    code: sanitizedCode,
  };

  if (req.body.percent) {
    try {
      couponData.percent = sanitizeNumber(req.body.percent, 1, 100);
    } catch (error) {
      return next(new ErrorHandler("Invalid percent value (1-100)", 400));
    }
  } else {
    return next(new ErrorHandler("Percent is required", 400));
  }

  if (req.body.minAmount) {
    try {
      couponData.minAmount = sanitizeNumber(req.body.minAmount, 0, 1000000);
    } catch (error) {
      return next(new ErrorHandler("Invalid minimum amount", 400));
    }
  }

  if (req.body.expiryDate) {
    const expiryDate = new Date(req.body.expiryDate);
    if (isNaN(expiryDate.getTime())) {
      return next(new ErrorHandler("Invalid expiry date", 400));
    }
    couponData.validUntil = expiryDate;
  }

  const coupon = await Coupon.create(couponData);

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

export const getCoupons = catchAsyncError(async (req, res, next) => {
  const coupons = await Coupon.find();

  const enrichedCoupons = coupons.map((coupon) => {
    const couponObj = coupon.toObject();

    let status = "active";
    if (couponObj.validUntil) {
      const now = new Date();
      const expiryDate = new Date(couponObj.validUntil);

      if (now > expiryDate) {
        status = "expired";
      } else if (couponObj.validFrom && now < new Date(couponObj.validFrom)) {
        status = "scheduled";
      }
    }

    return {
      ...couponObj,
      expiryDate: couponObj.validUntil || null,
      status,
      usageCount: couponObj.usedCount || 0,
    };
  });

  res.status(200).json({
    success: true,
    data: enrichedCoupons,
  });
});

export const getCouponById = catchAsyncError(async (req, res, next) => {
  let couponId;
  try {
    couponId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid coupon ID", 400));
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const updateCoupon = catchAsyncError(async (req, res, next) => {
  let couponId;
  try {
    couponId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid coupon ID", 400));
  }

  const updateData = {};

  if (req.body.code) {
    const sanitizedCode = sanitizeString(req.body.code.trim().toUpperCase());
    updateData.code = sanitizedCode;

    const exists = await Coupon.findOne({
      code: sanitizedCode,
      _id: { $ne: couponId },
    });

    if (exists) {
      return next(new ErrorHandler("Coupon code already exists", 400));
    }
  }

  if (req.body.percent) {
    try {
      updateData.percent = sanitizeNumber(req.body.percent, 1, 100);
    } catch (error) {
      return next(new ErrorHandler("Invalid percent value (1-100)", 400));
    }
  }

  if (req.body.minAmount !== undefined) {
    try {
      updateData.minAmount = sanitizeNumber(req.body.minAmount, 0, 1000000);
    } catch (error) {
      return next(new ErrorHandler("Invalid minimum amount", 400));
    }
  }

  if (req.body.expiryDate) {
    const expiryDate = new Date(req.body.expiryDate);
    if (isNaN(expiryDate.getTime())) {
      return next(new ErrorHandler("Invalid expiry date", 400));
    }
    updateData.validUntil = expiryDate;
  }

  const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
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
  let couponId;
  try {
    couponId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid coupon ID", 400));
  }

  const coupon = await Coupon.findByIdAndDelete(couponId);
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

  if (!code || typeof code !== "string") {
    return next(new ErrorHandler("Coupon code is required", 400));
  }

  const sanitizedCode = sanitizeString(code.toUpperCase());

  const coupon = await Coupon.findOne({
    code: sanitizedCode,
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

  
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "price salePrice"
  );

  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler("Cart is empty", 400));
  }


  const subTotal = cart.items.reduce((acc, item) => {
    const price = item.product?.salePrice ?? item.product?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);


  if (coupon.minAmount && coupon.minAmount > 0 && subTotal < coupon.minAmount) {
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

  const discountAmount = Math.round((subTotal * coupon.percent) / 100);

  cart.appliedCoupon = {
    code: coupon.code,
    percent: coupon.percent,
    discountAmount, 
  };

  if (coupon.usedCount !== undefined) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    cart,
  });
});