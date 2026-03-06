import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { Order } from "../../Models/orderSchema.js";

export const getOrderStats = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

  try {
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      monthlyStats,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "paid" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      (async () => {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
        const stats = await Order.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
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
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        }

        const statsMap = {};
        stats.forEach((m) => { statsMap[m._id] = m; });

        return months.map((m) => ({
          month: m,
          orders: statsMap[m]?.orders || 0,
          revenue: statsMap[m]?.revenue || 0,
        }));
      })(),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        paidOrders,
        shippedOrders,
        completedOrders,
        cancelledOrders,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return next(new ErrorHandler("Failed to fetch statistics", 500));
  }
});

export const getUserOrderStats = catchAsyncError(async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return next(new ErrorHandler("Unauthorized - Admin only", 403));
  }

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
    { $limit: 1000 },
  ]);

  res.status(200).json({ success: true, stats });
});