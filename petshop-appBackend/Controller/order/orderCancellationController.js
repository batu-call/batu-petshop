import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { Order } from "../../Models/orderSchema.js";
import { sanitizeString, sanitizeObjectId, createSafeRegex } from "../../utils/securityHelper.js";

export const requestCancellation = catchAsyncError(async (req, res, next) => {
  let orderId;
  try {
    orderId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  if (!["pending", "paid"].includes(order.status)) {
    return next(new ErrorHandler("This order cannot be cancelled", 400));
  }

  const { reason } = req.body;

  await Order.findByIdAndUpdate(orderId, {
    $set: {
      status: "cancellation_requested",
      cancelReason: sanitizeString(reason || ""),
    },
  });

  res.status(200).json({ success: true, message: "Cancellation request sent" });
});

export const getOrderByStatus = catchAsyncError(async (req, res, next) => {
  const { status, search } = req.query;

  if (!status) return next(new ErrorHandler("Status is required", 400));

  const validStatuses = [
    "pending", "paid", "shipped", "delivered", "cancelled", "cancellation_requested",
  ];
  if (!validStatuses.includes(status)) return next(new ErrorHandler("Invalid status", 400));

  let filter = { status };

  if (search && typeof search === "string") {
    const regex = createSafeRegex(search, 50);
    if (regex) filter["shippingAddress.fullName"] = regex;
  }

  const orders = await Order.find(filter)
    .populate("user", "name email avatar")
    .populate({ path: "items.product", select: "product_name image price slug" })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({ success: true, order: orders });
});