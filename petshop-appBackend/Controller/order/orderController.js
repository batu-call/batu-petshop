import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { Order } from "../../Models/orderSchema.js";
import { Product } from "../../Models/ProductSchema.js";
import { Cart } from "../../Models/CartSchema.js";
import mongoose, { Mongoose } from "mongoose";
import {
  sanitizeString,
  sanitizeObjectId,
  sanitizeNumber,
  buildSafeSortOptions,
  buildSafePagination,
  createSafeRegex,
  validateOrderItems,
  validateShippingAddress,
} from "../../utils/securityHelper.js";
import { sendOrderConfirmationMail } from "../mailController.js";

export const createOrder = catchAsyncError(async (req, res, next) => {
  let { items, shippingAddress, shippingFee, paymentIntentId, idempotencyKey } =
    req.body;

  if (idempotencyKey) {
    idempotencyKey = sanitizeString(idempotencyKey);
    const existingOrder = await Order.findOne({
      idempotencyKey,
    }).select("_id status totalAmount items shippingAddress shippingFee");

    if (existingOrder) {
      console.log(`Duplicate order prevented - idempotency key: ${idempotencyKey}`);
      try {
        await sendOrderConfirmationMail({
          order: existingOrder,
          customerName: existingOrder.shippingAddress?.fullName || "",
          customerEmail: existingOrder.shippingAddress?.email || "",
        });
      } catch (mailError) {
        console.error("Mail error (idempotency):", mailError.message);
      }
      return res.status(200).json({ success: true, order: existingOrder, message: "Order already exists" });
    }
  }

  if (paymentIntentId) {
    paymentIntentId = sanitizeString(paymentIntentId);
    const existingOrder = await Order.findOne({
      "paymentResult.id": paymentIntentId,
    }).select("_id status totalAmount items shippingAddress shippingFee");

    if (existingOrder) {
      console.log(`Duplicate order prevented - payment intent: ${paymentIntentId}`);
      try {
        await sendOrderConfirmationMail({
          order: existingOrder,
          customerName: existingOrder.shippingAddress?.fullName || "",
          customerEmail: existingOrder.shippingAddress?.email || "",
        });
      } catch (mailError) {
        console.error("Mail error (paymentIntent):", mailError.message);
      }
      return res.status(200).json({ success: true, order: existingOrder, message: "Order already exists" });
    }
  }

  try {
    validateOrderItems(items);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  let sanitizedAddress;
  try {
    sanitizedAddress = validateShippingAddress(shippingAddress);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }

  let finalShippingFee;
  try {
    finalShippingFee = sanitizeNumber(shippingFee || 0, 0, 1000);
  } catch (error) {
    return next(new ErrorHandler("Invalid shipping fee", 400));
  }

  const userCart = await Cart.findOne({ user: req.user._id });
  const appliedCoupon = userCart?.appliedCoupon || null;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      let productId;
      try {
        productId = sanitizeObjectId(item.product);
      } catch (error) {
        throw new ErrorHandler("Invalid product ID", 400);
      }

      let quantity;
      try {
        quantity = sanitizeNumber(item.quantity, 1, 999);
        if (quantity !== Math.floor(quantity)) throw new Error("Quantity must be a whole number");
      } catch (error) {
        throw new ErrorHandler(error.message, 400);
      }

      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity, sold: quantity } },
        { new: true, session, select: "product_name price salePrice image" },
      );

      if (!product) {
        throw new ErrorHandler(
          `Insufficient stock for: ${sanitizeString(item.name) || "Unknown product"}`,
          400,
        );
      }

      const actualPrice = product.salePrice ?? product.price;
      if (actualPrice <= 0) {
        throw new ErrorHandler(`Invalid price for product: ${product.product_name}`, 400);
      }

      calculatedTotal += actualPrice * quantity;
      orderItems.push({
        product: product._id,
        name: product.product_name || sanitizeString(item.name) || "Unknown Product",
        price: actualPrice,
        quantity,
        image: product.image?.[0]?.url || "",
      });
    }

    let discountAmount = 0;
    if (appliedCoupon?.percent > 0) {
      discountAmount = (calculatedTotal * appliedCoupon.percent) / 100;
    }

    const finalTotal = Math.max(calculatedTotal - discountAmount + finalShippingFee, 0);

    if (finalTotal <= 0 && discountAmount === 0) throw new ErrorHandler("Invalid total price", 400);
    if (finalTotal > 1000000) throw new ErrorHandler("Order total exceeds maximum limit", 400);

    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress: sanitizedAddress,
      totalAmount: finalTotal,
      shippingFee: finalShippingFee,
      discountAmount,
      couponCode: appliedCoupon?.code || "",
      status: paymentIntentId ? "paid" : "pending",
      idempotencyKey: idempotencyKey || `user-${req.user._id}-${Date.now()}`,
      paymentResult: paymentIntentId
        ? { id: paymentIntentId, status: "succeeded", email_address: sanitizedAddress.email }
        : undefined,
    };

    const { existing, order } = await Order.createOrderSafely(orderData, session);

    if (existing) {
      await session.abortTransaction();
      console.log(`Order already exists during creation: ${order._id}`);
      return res.status(200).json({ success: true, order, message: "Order already exists" });
    }

    await session.commitTransaction();

    try {
      await sendOrderConfirmationMail({
        order: {
          _id: order._id,
          items: orderItems,
          shippingAddress: sanitizedAddress,
          totalAmount: finalTotal,
          shippingFee: finalShippingFee,
          discountAmount,
          couponCode: appliedCoupon?.code || "",
        },
        customerName: sanitizedAddress.fullName,
        customerEmail: sanitizedAddress.email,
      });
    } catch (mailError) {
      console.error("Order confirmation email failed:", mailError.message);
    }

    res.status(201).json({ success: true, order, message: "Order created successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Order creation failed:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
});

export const getOrder = catchAsyncError(async (req, res, next) => {
  let orderId;
  try {
    orderId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate({ path: "items.product", select: "product_name image price slug" })
    .lean();

  if (!order) return next(new ErrorHandler("Order not found", 404));

  const isAdmin = req.user.role === "Admin";
  const isOwner = order.user?._id?.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return next(new ErrorHandler("Unauthorized access", 403));

  res.status(200).json({ success: true, order });
});

export const getUserOrder = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("user", "firstName lastName email")
    .populate({ path: "items.product", select: "product_name image price slug" })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({ success: true, orders });
});

export const AllOrders = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  const {
    page = 1, search, email, status,
    minPrice, maxPrice, startDate, endDate,
    sortBy = "createdAt", sortOrder = "desc",
  } = req.query;

  const { page: safePage, limit, skip } = buildSafePagination(page, 15);
  const matchStage = {};

if (search && typeof search === "string") {
  const trimmed = search.trim().replace(/^#/, "").toLowerCase();
  const regex = createSafeRegex(search.trim(), 50);

  const orConditions = [
    { "shippingAddress.fullName": regex },
    { "shippingAddress.phoneNumber": regex },
  ];

  if (/^[0-9a-f]{6,8}$/i.test(trimmed)) {
    orConditions.push({
      $expr: {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: trimmed,
          options: "i",
        },
      },
    });
  }

  matchStage.$or = orConditions;
}
  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled", "cancellation_requested"];
  if (status && validStatuses.includes(status)) matchStage.status = status;

  if (minPrice !== undefined || maxPrice !== undefined) {
    matchStage.totalAmount = {};
    if (minPrice !== undefined) {
      try { matchStage.totalAmount.$gte = sanitizeNumber(minPrice, 0); } catch (e) { console.warn(e.message); }
    }
    if (maxPrice !== undefined) {
      try { matchStage.totalAmount.$lte = sanitizeNumber(maxPrice, 0); } catch (e) { console.warn(e.message); }
    }
  }

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) matchStage.createdAt.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }
  }

  const emailRegex = email && typeof email === "string" ? createSafeRegex(email, 50) : null;
  const allowedSortFields = ["createdAt", "totalAmount", "status"];
  const sortOptions = buildSafeSortOptions(sortBy, sortOrder, allowedSortFields);

  if (emailRegex) {
    const pipeline = [
      { $match: matchStage },
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDetails" } },
      { $match: { "userDetails.email": emailRegex } },
    ];

    const countPipeline = [...pipeline, { $count: "total" }];
    const [countResult] = await Order.aggregate(countPipeline);
    const totalOrders = countResult?.total || 0;
    const totalAllOrders = await Order.countDocuments({});

    const dataPipeline = [
      ...pipeline,
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          user: {
            $cond: {
              if: { $gt: [{ $size: "$userDetails" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$userDetails._id", 0] },
                name: { $arrayElemAt: ["$userDetails.name", 0] },
                email: { $arrayElemAt: ["$userDetails.email", 0] },
                avatar: { $arrayElemAt: ["$userDetails.avatar", 0] },
              },
              else: null,
            },
          },
        },
      },
      { $unset: "userDetails" },
    ];

    let orders = await Order.aggregate(dataPipeline);
    orders = await Order.populate(orders, { path: "items.product", select: "product_name image price slug" });

    return res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      totalAllOrders,
      currentPage: safePage,
      orders,
    });
  }

  const [totalOrders, totalAllOrders] = await Promise.all([
    Order.countDocuments(matchStage),
    Order.countDocuments({}),
  ]);

  const orders = await Order.find(matchStage)
    .populate("user", "name avatar email")
    .populate({ path: "items.product", select: "product_name image price slug" })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders,
    totalAllOrders,
    currentPage: safePage,
    orders,
  });
});

export const getOrderByUserId = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  let userId;
  try {
    userId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid user ID", 400));
  }

  const orders = await Order.find({ user: userId })
    .populate("user", "firstName lastName email")
    .populate({ path: "items.product", select: "product_name image price slug" })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({ success: true, orders });
});