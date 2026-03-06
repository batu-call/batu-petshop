import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import { Product } from "../../Models/ProductSchema.js";
import { sanitizeString, sanitizeNumber } from "../../utils/securityHelper.js";

const VALID_CATEGORIES = ["Dog", "Cat", "Bird", "Fish", "Reptile", "Rabbit", "Horse"];

export const getPriceStats = catchAsyncError(async (req, res, next) => {
  const { category } = req.query;
  const filter = { isActive: true };

  if (category) {
    const categories = category.split(",").map((c) => sanitizeString(c.trim()));
    const validCats = categories.filter((c) => VALID_CATEGORIES.includes(c));
    if (validCats.length > 0) filter.category = { $in: validCats };
  }

  const stats = await Product.aggregate([
    { $match: filter },
    {
      $project: {
        effectivePrice: {
          $cond: [
            {
              $and: [
                { $ne: ["$salePrice", null] },
                { $gt: ["$salePrice", 0] },
                { $lt: ["$salePrice", "$price"] },
              ],
            },
            "$salePrice",
            "$price",
          ],
        },
      },
    },
    { $match: { effectivePrice: { $gt: 0 } } },
    { $group: { _id: null, min: { $min: "$effectivePrice" }, max: { $max: "$effectivePrice" } } },
  ]);

  const result = stats.length > 0
    ? { min: Math.floor(stats[0].min), max: Math.ceil(stats[0].max) }
    : { min: 0, max: 1000 };

  res.status(200).json({ success: true, ...result });
});

export const getProductStats = catchAsyncError(async (req, res, next) => {
  try {
    const [
      totalProducts, inStock, outOfStock, activeProducts, inactiveProducts,
      featuredProducts, soldStats, newThisMonth, categoryData,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0 } }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ isFeatured: true }),
      Product.aggregate([{ $group: { _id: null, totalSold: { $sum: "$sold" } } }]),
      (async () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return await Product.countDocuments({ createdAt: { $gte: monthStart } });
      })(),
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalSold = soldStats.length > 0 ? soldStats[0].totalSold : 0;

    const featuredProductsList = await Product.find({ isFeatured: true })
      .select("product_name slug _id")
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalProducts, inStock, outOfStock, activeProducts, inactiveProducts,
        featuredProducts, totalSold, newThisMonth, categoryData, featuredProductsList,
      },
    });
  } catch (error) {
    console.error("Product stats error:", error);
    res.status(500).json({ success: false, message: "Error fetching product statistics" });
  }
});