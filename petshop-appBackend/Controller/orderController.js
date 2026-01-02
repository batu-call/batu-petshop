import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { Order } from "../Models/orderSchema.js";
import { Product } from "../Models/ProductSchema.js";

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { items, shippingAddress, totalAmount } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorHandler("No Order Items!", 400));
  }

  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.city ||
    !shippingAddress?.address
  ) {
    return next(new ErrorHandler("Incomplete shipping address!", 400));
  }

  if (!totalAmount || totalAmount <= 0) {
    return next(new ErrorHandler("Invalid total price!", 400));
  }

  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorHandler("Product not found!", 404));
    }

    
    if (product.stock < item.quantity) {
      return next(
        new ErrorHandler(
          `${product.product_name} There is not enough stock for!`,
          400
        )
      );
    }

    orderItems.push({
      product: product._id,
      name: product.product_name,
      price: item.price,
      quantity: item.quantity,
      image: product.image?.[0]?.url || "",
    });
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    totalAmount,
    status: "pending",
  });

  for(const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: -item.quantity,
          sold: item.quantity
        }
      },
      {new:true}
    )
  }

  res.status(201).json({
    success: true,
    order,
  });
});

export const getOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate({
      path: "items.product",
      select: "product_name image price",
    });

  if (!order) {
    return next(new ErrorHandler("Order Not Found!", 400));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const getUserOrder = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate("user" , "firstName lastName email")
    .populate({
      path: "items.product",
      select: "product_name image price",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const AllOrders = catchAsyncError(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Unauthorized"), 401);
  }

  const orders = await Order.find()
    .populate("user", "name email")
    .populate({
      path: "items.product",
      select: "product_name image price",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const updateOrderToPaid = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order Not Found!", 400));
  }

  order.status = "paid";
  order.paymentResult = {
    id: req.body.id || null,
    status: req.body.status || "succeeded",
    email_address: req.body.email_address || order.shippingAddress.email,
  };

  const updateOrder = await order.save();

  res.status(200).json({
    success: true,
    updateOrder,
  });
});

export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order Not Found!"), 400);
  }

  order.status = req.body.status;
  const updateOrder = await order.save();

  res.status(200).json({
    success: true,
    updateOrder,
  });
});

export const getOrdeByStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.query;

  if (!status) {
    return next(new ErrorHandler("Status is required!"), 400);
  }

  const order = await Order.find({ status }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    order,
  });
});

export const MarkOrderAsDelivered = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order Not Found!"), 400);
  }

  order.status = "delivered";

  const updateOrder = await order.save();

  res.status(200).json({
    success: true,
    updateOrder,
  });
});

export const getOrderStats = catchAsyncError(async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setDate(1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const monthlyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [];
    for (let i = 0; i <= 12; i++) {
      const d = new Date(
        oneYearAgo.getFullYear(),
        oneYearAgo.getMonth() + i,
        1
      );
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      months.push(monthStr);
    }

    const statsMap = {};
    monthlyStats.forEach((m) => {
      statsMap[m._id] = m;
    });

    const formattedMonthlyStats = months.map((m) => ({
      month: m,
      orders: statsMap[m]?.orders || 0,
      revenue: statsMap[m]?.revenue || 0,
    }));

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        monthlyStats: formattedMonthlyStats,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getOrderByUserId = catchAsyncError(async (req, res, next) => {

  const orders = await Order.find({ user: req.params.id })
    .populate("user", "firstName lastName email")
    .populate({
      path: "items.product",
      select: "product_name image price",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getUserOrderStats = catchAsyncError(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        lastOrderAt: { $max: "$createdAt" },
        totalSpent: { $sum: "$totalAmount" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        orderCount: 1,
        lastOrderAt: 1,
        totalSpent: 1,
        "user.firstName": 1,
        "user.lastName": 1,
        "user.email": 1,
        "user.avatar": 1,
        "user.createdAt": 1,
      },
    },
    { $sort: { lastOrderAt: -1 } },
  ]);

  res.status(200).json({
    success: true,
    stats,
  });
});
