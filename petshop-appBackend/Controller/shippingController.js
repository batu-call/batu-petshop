import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ShippingSetting from "../Models/ShippingSetting.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";

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


    if (fee !== undefined && fee < 0) {
      return next(new ErrorHandler("Shipping fee cannot be negative", 400));
    }

    if (freeOver !== undefined && freeOver < 0) {
      return next(
        new ErrorHandler("Free shipping amount cannot be negative", 400)
      );
    }

    let settings = await ShippingSetting.findOne();

    if (!settings) {
      settings = await ShippingSetting.create({
        fee: fee || 0,
        freeOver: freeOver || 0,
      });
    } else {
      if (fee !== undefined) settings.fee = fee;
      if (freeOver !== undefined) settings.freeOver = freeOver;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Shipping settings updated successfully",
      data: settings,
    });
  }
);
