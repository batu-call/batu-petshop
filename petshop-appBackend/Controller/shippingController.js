import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ShippingSetting from "../Models/ShippingSetting.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { sanitizeNumber } from "../utils/securityHelper.js";

export const getShippingSettings = catchAsyncError(
  async (req, res, next) => {
    let settings = await ShippingSetting.findOne();

    if (!settings) {
      settings = await ShippingSetting.create({
        fee: 0,
        freeOver: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  }
);

export const updateShippingSettings = catchAsyncError(
  async (req, res, next) => {
    const { fee, freeOver } = req.body;
    
    let sanitizedFee, sanitizedFreeOver;

    if (fee !== undefined) {
      try {
        sanitizedFee = sanitizeNumber(fee, 0, 1000);
      } catch (error) {
        return next(new ErrorHandler("Invalid shipping fee (0-1000)", 400));
      }
    }

    if (freeOver !== undefined) {
      try {
        sanitizedFreeOver = sanitizeNumber(freeOver, 0, 100000);
      } catch (error) {
        return next(new ErrorHandler("Invalid free shipping threshold", 400));
      }
    }

    let settings = await ShippingSetting.findOne();

    if (!settings) {
      settings = await ShippingSetting.create({
        fee: sanitizedFee ?? 0,
        freeOver: sanitizedFreeOver ?? 0,
      });
    } else {
      if (sanitizedFee !== undefined) settings.fee = sanitizedFee;
      if (sanitizedFreeOver !== undefined) settings.freeOver = sanitizedFreeOver;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Shipping settings updated successfully",
      data: settings,
    });
  }
);