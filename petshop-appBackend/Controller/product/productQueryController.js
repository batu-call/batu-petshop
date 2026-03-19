import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import { Product, SUB_CATEGORIES } from "../../Models/ProductSchema.js";
import { Review } from "../../Models/reviewsSchema.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import slugify from "slugify";
import {
  sanitizeString,
  sanitizeObjectId,
  sanitizeNumber,
  sanitizeBoolean,
  buildSafePagination,
  createSafeRegex,
} from "../../utils/securityHelper.js";

const VALID_CATEGORIES = [
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Reptile",
  "Rabbit",
  "Horse",
];
const ALL_SUB_CATEGORIES = [...new Set(Object.values(SUB_CATEGORIES).flat())];
const VALID_SORT_OPTIONS = [
  "default",
  "rating",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
];

export const getAllProduct = catchAsyncError(async (req, res, next) => {
  const {
    category,
    subCategory,
    page = 1,
    minPrice,
    maxPrice,
    onSale,
    minRating,
    sortBy = "default",
    search
  } = req.query;

  const { page: safePage, limit, skip } = buildSafePagination(page, 20);

  const filter = { isActive: true, stock: { $gt: 0 } };

  if (category) {
    const categories = category.split(",").map((c) => sanitizeString(c.trim()));
    const validCats = categories.filter((c) => VALID_CATEGORIES.includes(c));
    if (validCats.length > 0) filter.category = { $in: validCats };
  }

  if (subCategory) {
    const sanitized = sanitizeString(subCategory.trim());
    if (ALL_SUB_CATEGORIES.includes(sanitized)) {
      filter.subCategory = sanitized;
    }
  }

  if (search && typeof search === "string") {
    const rx = createSafeRegex(search, 50);
    if (rx) filter.$or = [{ product_name: rx }, { description: rx }];
  }

  const totalAllProducts = await Product.countDocuments(filter);

  if (minPrice || maxPrice) {
    try {
      const min = minPrice ? sanitizeNumber(minPrice, 0, 1000000) : 0;
      const max = maxPrice ? sanitizeNumber(maxPrice, 0, 1000000) : Number.MAX_SAFE_INTEGER;
      if (min > max) return next(new ErrorHandler("minPrice cannot be greater than maxPrice", 400));
      filter.$or = [
        { salePrice: { $ne: null, $gte: min, $lte: max } },
        { salePrice: null, price: { $gte: min, $lte: max } },
      ];
    } catch (error) {
      return next(new ErrorHandler("Invalid price range", 400));
    }
  }

  if (onSale === "true") filter.salePrice = { $ne: null };

  let minRatingNum = null;
  if (minRating) {
    try {
      minRatingNum = sanitizeNumber(minRating, 0, 5);
    } catch (error) {
      return next(new ErrorHandler("Invalid rating value (0-5)", 400));
    }
  }

  let totalFilteredProducts = await Product.countDocuments(filter);
  let products;
  const safeSortBy = VALID_SORT_OPTIONS.includes(sortBy) ? sortBy : "default";

  if (safeSortBy === "rating") {
    const allProducts = await Product.find(filter).lean();
    const reviewStats = await Review.aggregate([
      { $match: { productId: { $in: allProducts.map((p) => p._id) } } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    reviewStats.forEach((s) => {
      statsMap[s._id.toString()] = { avgRating: s.avgRating, count: s.count };
    });

    let sorted = allProducts
      .map((p) => ({
        ...p,
        avgRating: statsMap[p._id.toString()]?.avgRating || 0,
        reviewCount: statsMap[p._id.toString()]?.count || 0,
      }))
      .sort((a, b) => {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    if (minRatingNum) {
      sorted = sorted.filter((p) => p.avgRating >= minRatingNum);
      totalFilteredProducts = sorted.length;
    }

    products = sorted.slice(skip, skip + limit);

  } else if (safeSortBy === "price-asc" || safeSortBy === "price-desc") {
    const sortDir = safeSortBy === "price-asc" ? 1 : -1;
    let aggFilter = { ...filter };

    if (minRatingNum) {
      const rs = await Review.aggregate([
        { $group: { _id: "$productId", avgRating: { $avg: "$rating" } } },
        { $match: { avgRating: { $gte: minRatingNum } } },
      ]);
      const ids = rs.map((s) => s._id);
      if (ids.length > 0) {
        aggFilter._id = { $in: ids };
        totalFilteredProducts = await Product.countDocuments(aggFilter);
      } else {
        products = [];
        totalFilteredProducts = 0;
      }
    }

    if (!products) {
      products = await Product.aggregate([
        { $match: aggFilter },
        {
          $addFields: {
            effectivePrice: {
              $cond: {
                if: { $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }] },
                then: "$salePrice",
                else: "$price",
              },
            },
          },
        },
        { $sort: { effectivePrice: sortDir } },
        { $skip: skip },
        { $limit: limit },
      ]);
    }

  } else {
    let sortOption = {};
    switch (safeSortBy) {
      case "name-asc":
        sortOption = { product_name: 1 };
        break;
      case "name-desc":
        sortOption = { product_name: -1 };
        break;
      default:
        sortOption = { isFeatured: -1, createdAt: -1 };
    }

    if (minRatingNum) {
      const rs = await Review.aggregate([
        { $group: { _id: "$productId", avgRating: { $avg: "$rating" } } },
        { $match: { avgRating: { $gte: minRatingNum } } },
      ]);
      const ids = rs.map((s) => s._id);
      if (ids.length > 0) {
        filter._id = { $in: ids };
        totalFilteredProducts = await Product.countDocuments(filter);
      } else {
        products = [];
        totalFilteredProducts = 0;
      }
    }

    if (!products) {
      products = await Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
    }
  }

  const updatedProducts = products.map((p) => ({
    ...p,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    products: updatedProducts,
    totalPages: Math.ceil(totalFilteredProducts / limit),
    currentPage: safePage,
    totalProducts: totalAllProducts,
    filteredProducts: totalFilteredProducts,
  });
});

export const getSimilarProducts = catchAsyncError(async (req, res, next) => {
  let productId;
  try {
    productId = sanitizeObjectId(req.params.productId);
  } catch (e) {
    return next(new ErrorHandler("Invalid product ID", 400));
  }

  let validLimit;
  try {
    validLimit = req.query.limit ? sanitizeNumber(req.query.limit, 1, 50) : 7;
  } catch (e) {
    validLimit = 7;
  }

  const product = await Product.findById(productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const baseFilter = {
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
    stock: { $gt: 0 },
  };

  let products = [];
  if (product.subCategory) {
    products = await Product.find({
      ...baseFilter,
      subCategory: product.subCategory,
    })
      .limit(validLimit)
      .sort({ createdAt: -1 });
  }

  if (products.length < validLimit) {
    const existingIds = products.map((p) => p._id);
    const remaining = validLimit - products.length;

    const fallback = await Product.find({
      ...baseFilter,
      _id: { $ne: product._id, $nin: existingIds },
    })
      .limit(remaining)
      .sort({ createdAt: -1 });

    products = [...products, ...fallback];
  }

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({ success: true, products: updatedProducts });
});

export const getAdminAllProduct = catchAsyncError(async (req, res, next) => {
  const {
    category,
    subCategory,
    page = 1,
    search,
    minPrice,
    maxPrice,
    minSold,
    maxSold,
    minStock,
    maxStock,
    isActive,
    isFeatured,
    onSale,
    limit = 15,
  } = req.query;

  const {
    page: safePage,
    limit: safeLimit,
    skip,
  } = buildSafePagination(page, limit, 100);
  const totalAllProducts = await Product.countDocuments();
  let filter = {};

  if (category && VALID_CATEGORIES.includes(sanitizeString(category)))
    filter.category = sanitizeString(category);

  if (subCategory) {
    const sanitized = sanitizeString(subCategory.trim());
    const ALL_SUBS = [...new Set(Object.values(SUB_CATEGORIES).flat())];
    if (ALL_SUBS.includes(sanitized)) filter.subCategory = sanitized;
  }

  if (isActive !== undefined && isActive !== "") {
    const v = sanitizeBoolean(isActive);
    if (v !== null) filter.isActive = v;
  }
  if (isFeatured !== undefined && isFeatured !== "") {
    const v = sanitizeBoolean(isFeatured);
    if (v !== null) filter.isFeatured = v;
  }
  if (onSale === "true") filter.salePrice = { $ne: null };

  if (search && typeof search === "string") {
    const rx = createSafeRegex(search, 50);
    if (rx) filter.$or = [{ product_name: rx }, { description: rx }];
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice)
      try {
        filter.price.$gte = sanitizeNumber(minPrice, 0, 1000000);
      } catch (e) {
        return next(new ErrorHandler("Invalid minPrice", 400));
      }
    if (maxPrice)
      try {
        filter.price.$lte = sanitizeNumber(maxPrice, 0, 1000000);
      } catch (e) {
        return next(new ErrorHandler("Invalid maxPrice", 400));
      }
  }
  if (minSold || maxSold) {
    filter.sold = {};
    if (minSold)
      try {
        filter.sold.$gte = sanitizeNumber(minSold, 0, 1000000);
      } catch (e) {
        return next(new ErrorHandler("Invalid minSold", 400));
      }
    if (maxSold)
      try {
        filter.sold.$lte = sanitizeNumber(maxSold, 0, 1000000);
      } catch (e) {
        return next(new ErrorHandler("Invalid maxSold", 400));
      }
  }
  if (minStock || maxStock) {
    filter.stock = {};
    if (minStock)
      try {
        filter.stock.$gte = sanitizeNumber(minStock, 0, 100000);
      } catch (e) {
        return next(new ErrorHandler("Invalid minStock", 400));
      }
    if (maxStock)
      try {
        filter.stock.$lte = sanitizeNumber(maxStock, 0, 100000);
      } catch (e) {
        return next(new ErrorHandler("Invalid maxStock", 400));
      }
  }

  const filteredProducts = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(filteredProducts / safeLimit),
    totalProducts: totalAllProducts,
    filteredProducts,
    products: updatedProducts,
  });
});

export const getLatestProduct = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(10);
  res.status(200).json({ success: true, products });
});

export const getHotDeals = catchAsyncError(async (req, res, next) => {
  let validLimit;
  try {
    validLimit = req.query.limit ? sanitizeNumber(req.query.limit, 1, 50) : 10;
  } catch (e) {
    validLimit = 10;
  }
  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
    salePrice: { $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(validLimit);
  res.status(200).json({ success: true, products });
});

export const featuredProducts = catchAsyncError(async (req, res, next) => {
  let validLimit;
  try {
    validLimit = req.query.limit ? sanitizeNumber(req.query.limit, 1, 50) : 10;
  } catch (e) {
    validLimit = 10;
  }
  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
    isFeatured: true,
  })
    .sort({ updatedAt: -1 })
    .limit(validLimit);
  res.status(200).json({ success: true, products });
});

export const getProductBySlug = catchAsyncError(async (req, res, next) => {
  const slug = sanitizeString(req.params.slug);
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) return next(new ErrorHandler("Product Not Found!", 404));
  res.status(200).json({ success: true, product });
});

export const getProductById = catchAsyncError(async (req, res, next) => {
  let productId;
  try {
    productId = sanitizeObjectId(req.params.id);
  } catch (e) {
    return next(new ErrorHandler("Invalid product ID", 400));
  }
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return next(new ErrorHandler("Product Not Found!", 404));
  res.status(200).json({ success: true, product });
});

export const getAdminProductBySlug = catchAsyncError(async (req, res, next) => {
  const slug = sanitizeString(req.params.slug);
  const product = await Product.findOne({ slug });
  if (!product) return next(new ErrorHandler("Product Not Found!", 404));
  res.status(200).json({ success: true, product });
});

export const searchProducts = catchAsyncError(async (req, res, next) => {
  const { query } = req.query;
  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ message: "Search query required" });
  }
  try {
    const safeRegex = createSafeRegex(query, 100);
    if (!safeRegex)
      return res.status(400).json({ message: "Invalid search query" });
    const products = await Product.find({
      isActive: true,
      stock: { $gt: 0 },
      $or: [{ product_name: safeRegex }, { description: safeRegex }],
    }).limit(50);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});
