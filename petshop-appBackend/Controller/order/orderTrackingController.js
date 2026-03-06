import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { Order } from "../../Models/orderSchema.js";
import { sanitizeString, sanitizeObjectId } from "../../utils/securityHelper.js";
import { sendShippedMail, sendCancellationMail } from "../mailController.js";
import { getStripe } from "../stripeController.js";

export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  let orderId;
  try {
    orderId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const { status, note, trackingNumber, cargoCompany, estimatedDelivery } = req.body;

  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) return next(new ErrorHandler("Invalid status", 400));

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.status === "delivered" && status !== "cancelled") {
    return next(new ErrorHandler("Delivered orders can only be cancelled", 400));
  }
  if (order.status === "cancellation_requested" && status !== "cancelled") {
    return next(new ErrorHandler("Cancellation requested orders can only be cancelled or kept", 400));
  }
  if (order.status === "cancelled") {
    return next(new ErrorHandler("Cancelled orders cannot be changed", 400));
  }

  const updateData = {
    status,
    updatedAt: new Date(),
    ...(note ? { statusNote: sanitizeString(note) } : {}),
  };

  if (status === "shipped") {
    const validCargoCompanies = ["UPS", "DHL", "FedEx", "USPS", "Other"];
    if (trackingNumber) {
      updateData["tracking.trackingNumber"] = sanitizeString(trackingNumber).slice(0, 100);
    }
    if (cargoCompany && validCargoCompanies.includes(cargoCompany)) {
      updateData["tracking.cargoCompany"] = cargoCompany;
      const num = trackingNumber || order.tracking?.trackingNumber || "";
      if (num) {
        const urls = {
          UPS: `https://www.ups.com/track?tracknum=${num}`,
          DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${num}`,
          FedEx: `https://www.fedex.com/fedextrack/?trknbr=${num}`,
          USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`,
          Other: "",
        };
        updateData["tracking.trackingUrl"] = urls[cargoCompany] || "";
      }
    }
    if (estimatedDelivery) {
      const estDate = new Date(estimatedDelivery);
      if (!isNaN(estDate.getTime())) updateData["tracking.estimatedDelivery"] = estDate;
    }
    updateData["tracking.shippedAt"] = new Date();
  }

  if (status === "cancelled" && order.paymentResult?.id) {
    try {
      await getStripe().refunds.create({ payment_intent: order.paymentResult.id });
      console.log(`Refund created for order: ${orderId}`);
    } catch (refundError) {
      console.error("Refund failed:", refundError.message);
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true, runValidators: false },
  );

  if (status === "cancelled") {
    try {
      await sendCancellationMail({
        order: updatedOrder,
        customerName: updatedOrder.shippingAddress.fullName,
        customerEmail: updatedOrder.shippingAddress.email,
      });
    } catch (mailError) {
      console.error("Cancellation email failed:", mailError.message);
    }
  }

  if (status === "shipped") {
    try {
      await sendShippedMail({
        order: updatedOrder,
        customerName: updatedOrder.shippingAddress.fullName,
        customerEmail: updatedOrder.shippingAddress.email,
      });
    } catch (mailError) {
      console.error("Shipped notification email failed:", mailError.message);
    }
  }

  res.status(200).json({ success: true, order: updatedOrder });
});

export const updateTracking = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  let orderId;
  try {
    orderId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const { trackingNumber, cargoCompany, estimatedDelivery } = req.body;
  const validCargoCompanies = ["UPS", "DHL", "FedEx", "USPS", "Other"];

  if (!trackingNumber || !cargoCompany) {
    return next(new ErrorHandler("Tracking number and cargo company are required", 400));
  }
  if (!validCargoCompanies.includes(cargoCompany)) {
    return next(new ErrorHandler("Invalid cargo company", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  const cleanTrackingNumber = sanitizeString(trackingNumber).slice(0, 100);
  const urls = {
    UPS: `https://www.ups.com/track?tracknum=${cleanTrackingNumber}`,
    DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${cleanTrackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${cleanTrackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanTrackingNumber}`,
    Other: "",
  };

  const updateData = {
    "tracking.trackingNumber": cleanTrackingNumber,
    "tracking.cargoCompany": cargoCompany,
    "tracking.trackingUrl": urls[cargoCompany] || "",
  };

  if (estimatedDelivery) {
    const estDate = new Date(estimatedDelivery);
    if (!isNaN(estDate.getTime())) updateData["tracking.estimatedDelivery"] = estDate;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true },
  );

  console.log(`Order ${orderId} tracking updated: ${cleanTrackingNumber} via ${cargoCompany}`);
  res.status(200).json({ success: true, message: "Tracking information updated successfully", order: updatedOrder });
});

export const MarkOrderAsDelivered = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  let orderId;
  try {
    orderId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.status === "delivered") return next(new ErrorHandler("Order is already delivered", 400));

  await order.updateStatus("delivered", "Marked as delivered");
  res.status(200).json({ success: true, order });
});