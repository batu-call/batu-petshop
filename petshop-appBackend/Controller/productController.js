import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { Product } from "../Models/ProductSchema.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import cloudinary from "cloudinary";
import fs from "fs";
import slugify from "slugify";
import { nanoid } from "nanoid";

export const newProduct = catchAsyncError(async (req, res, next) => {
  const {
    product_name,
    description,
    price,
    category,
    productFeatures,
    stock,
    isActive,
    isFeatured,
  } = req.body;

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return next(new ErrorHandler("Please upload at least one image", 400));
  }

  if (
    !product_name ||
    !description ||
    !price ||
    !category ||
    !productFeatures
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }


  const uploadPromises = req.files.map((file) =>
    cloudinary.v2.uploader
      .upload(file.path, {
        folder: "Products",
      })
      .then((result) => {
        // Upload başarılı olduktan sonra dosyayı sil
        fs.unlinkSync(file.path);
        return {
          publicId: result.public_id,
          url: result.secure_url,
        };
      })
      .catch((error) => {
        // Hata durumunda dosyayı temizle
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      })
  );

  let uploadedImages;
  try {
    uploadedImages = await Promise.all(uploadPromises);
  } catch (error) {
    return next(
      new ErrorHandler("Failed to upload images to cloud storage", 500)
    );
  }

  let parseFeatures;
  try {
    parseFeatures =
      typeof productFeatures === "string"
        ? JSON.parse(productFeatures)
        : productFeatures;
  } catch (err) {
    return next(new ErrorHandler("Invalid productFeatures format", 400));
  }

  const baseSlug = slugify(product_name, { lower: true, strict: true });
  const uniqueSlug = `${baseSlug}-${nanoid(6)}`;

  const product = await Product.create({
    product_name,
    description,
    price,
    category,
    stock: stock ?? 100,
    isActive: isActive === "true" || isActive === true,
    isFeatured: isFeatured === "true" || isFeatured === true,
    sold: 0,
    image: uploadedImages,
    slug: uniqueSlug,
    productFeatures: parseFeatures,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found!", 404));
  }

  // Paralel olarak tüm resimleri sil
  const deletePromises = product.image.map((image) =>
    cloudinary.v2.uploader.destroy(image.publicId)
  );

  await Promise.all(deletePromises);

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const deleteProductImage = catchAsyncError(async (req, res, next) => {
  const { productId, imageId } = req.params;
  const { publicId } = req.body;

  if (!publicId) {
    return next(new ErrorHandler("Public ID is required", 400));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (product.image.length <= 1) {
    return next(new ErrorHandler("Product must have at least one image", 400));
  }

  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return next(new ErrorHandler("Failed to delete image from cloud", 500));
  }

  product.image = product.image.filter(
    (img) => img._id.toString() !== imageId
  );

  await product.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    product,
  });
});

export const getAllProduct = catchAsyncError(async (req, res, next) => {
  const {
    category,
    page = 1,
    minPrice,
    maxPrice,
    onSale,
    minRating,
    sortBy,
  } = req.query;

  const limit = 15;
  const skip = (Number(page) - 1) * limit;

  const filter = { isActive: true };

  if (category) {
    const categories = category.split(",");
    filter.category = { $in: categories };
  }

  if (minPrice || maxPrice) {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

    filter.$or = [
      {
        salePrice: { $ne: null, $gte: min, $lte: max },
      },
      {
        salePrice: null,
        price: { $gte: min, $lte: max },
      },
    ];
  }

  if (onSale === "true") {
    filter.salePrice = { $ne: null };
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  const totalFilteredProducts = await Product.countDocuments(filter);

  let query = Product.find(filter);

  switch (sortBy) {
    case "price-asc":
      query = query.sort({
        salePrice: 1,
        price: 1,
      });
      break;

    case "price-desc":
      query = query.sort({
        salePrice: -1,
        price: -1,
      });
      break;

    case "name-asc":
      query = query.sort({ product_name: 1 });
      break;

    case "name-desc":
      query = query.sort({ product_name: -1 });
      break;

    default:
      query = query.sort({ createdAt: -1 });
  }

  const products = await query.skip(skip).limit(limit);

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    products: updatedProducts,
    totalPages: Math.ceil(totalFilteredProducts / limit),
    currentPage: Number(page),
    totalProducts: totalFilteredProducts,
  });
});

export const getSimilarProducts = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const limit = Number(req.query.limit) || 7;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const products = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .limit(limit)
    .sort({ createdAt: -1 });

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    products: updatedProducts,
  });
});

export const getAdminAllProduct = catchAsyncError(async (req, res, next) => {
  const {
    category,
    page = 1,
    search,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    isActive,
    limit = 15,
  } = req.query;

  const pageLimit = Number(limit);
  const skip = (Number(page) - 1) * pageLimit;

  let filter = {};

  if (category) {
    filter.category = category;
  }

  // isActive filter
  if (isActive !== undefined && isActive !== "") {
    filter.isActive = isActive === "true";
  }

  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (search && typeof search === "string") {
    const safeSearch = escapeRegex(search.trim().slice(0, 50));

    filter.$or = [
      { product_name: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minStock || maxStock) {
    filter.stock = {};
    if (minStock) filter.stock.$gte = Number(minStock);
    if (maxStock) filter.stock.$lte = Number(maxStock);
  }

  const totalProducts = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    totalPages: Math.ceil(totalProducts / pageLimit),
    totalProducts,
    products: updatedProducts,
  });
});

export const getLatestProduct = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    products,
  });
});

export const getHotDeals = catchAsyncError(async (req, res, next) => {
  const limit = Number(req.query.limit) || 10;

  const products = await Product.find({
    isActive: true,
    salePrice: { $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    products,
  });
});

export const featuredProducts = catchAsyncError(async (req, res, next) => {
  const limit = Number(req.query.limit) || 10;

  const products = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ updatedAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    products,
  });
});

export const getProductBySlug = catchAsyncError(async (req, res, next) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: true });

  if (!product) {
    return next(new ErrorHandler("Product Not Found!", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

export const getProductById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    _id: id,
    isActive: true,
  });

  if (!product) {
    return next(new ErrorHandler("Product Not Found!", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

export const getAdminProductBySlug = catchAsyncError(
  async (req, res, next) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      return next(new ErrorHandler("Product Not Found!", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      product_name,
      description,
      price,
      salePrice,
      productFeatures,
      stock,
      isActive,
      isFeatured,
      category,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const finalPrice = price ? Number(price) : product.price;

    if (
      salePrice &&
      salePrice !== "" &&
      salePrice !== "null" &&
      salePrice !== "undefined"
    ) {
      const salePriceNum = Number(salePrice);
      if (salePriceNum >= finalPrice) {
        return res.status(400).json({
          success: false,
          message: "Sale price must be lower than price",
        });
      }
    }

    // Yeni resimler varsa PARALEL olarak yükle
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.v2.uploader
          .upload(file.path, {
            folder: "Products",
          })
          .then((result) => {
            fs.unlinkSync(file.path);
            return {
              publicId: result.public_id,
              url: result.secure_url,
            };
          })
          .catch((error) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            throw error;
          })
      );

      try {
        const uploadedImages = await Promise.all(uploadPromises);
        product.image.push(...uploadedImages);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          error: error.message,
        });
      }
    }

    if (product_name && product_name !== product.product_name) {
      product.product_name = product_name;

      const baseSlug = slugify(product_name, {
        lower: true,
        strict: true,
      });
      product.slug = `${baseSlug}-${nanoid(6)}`;
    }

    if (description !== undefined && description !== null) {
      product.description = description;
    }

    if (price !== undefined && price !== null && price !== "") {
      product.price = Number(price);
    }

    if (
      salePrice === "" ||
      salePrice === null ||
      salePrice === "null" ||
      salePrice === "undefined" ||
      salePrice === undefined
    ) {
      product.salePrice = null;
    } else {
      product.salePrice = Number(salePrice);
    }

    if (productFeatures !== undefined && productFeatures !== null) {
      try {
        product.productFeatures =
          typeof productFeatures === "string"
            ? JSON.parse(productFeatures)
            : productFeatures;
      } catch (err) {
        console.error("Error parsing productFeatures:", err);
      }
    }

    if (stock !== undefined && stock !== null && stock !== "") {
      product.stock = Number(stock);
    }

    if (isActive !== undefined && isActive !== null) {
      if (typeof isActive === "boolean") {
        product.isActive = isActive;
      } else if (isActive === "true") {
        product.isActive = true;
      } else if (isActive === "false") {
        product.isActive = false;
      }
    }

    if (isFeatured !== undefined && isFeatured !== null) {
      if (typeof isFeatured === "boolean") {
        product.isFeatured = isFeatured;
      } else if (isFeatured === "true") {
        product.isFeatured = true;
      } else if (isFeatured === "false") {
        product.isFeatured = false;
      }
    }

    if (category && category !== null && category !== "") {
      product.category = category;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

export const getPriceStats = catchAsyncError(async (req, res, next) => {
  const { category } = req.query;

  const filter = { isActive: true };

  if (category) {
    const categories = category.split(",");
    filter.category = { $in: categories };
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
    {
      $match: {
        effectivePrice: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        min: { $min: "$effectivePrice" },
        max: { $max: "$effectivePrice" },
      },
    },
  ]);

  const result =
    stats.length > 0
      ? { min: Math.floor(stats[0].min), max: Math.ceil(stats[0].max) }
      : { min: 0, max: 1000 };

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const searchProducts = catchAsyncError(async (req, res, next) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query required" });
  }

  try {
    const products = await Product.find({
      isActive: true,
      $or: [
        { product_name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

export const getProductStats = catchAsyncError(async (req, res, next) => {
  try {
    const [
      totalProducts,
      inStock,
      outOfStock,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      soldStats,
      newThisMonth,
      categoryData,
    ] = await Promise.all([

      Product.countDocuments(),

      Product.countDocuments({ stock: { $gt: 0 } }),

      Product.countDocuments({ stock: 0 }),

      Product.countDocuments({ isActive: true }),

      Product.countDocuments({ isActive: false }),

      Product.countDocuments({ isFeatured: true }),

      // Total sold - aggregate from Product.sold field
      Product.aggregate([
        { $group: { _id: null, totalSold: { $sum: "$sold" } } },
      ]),

      // New this month
      (async () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return await Product.countDocuments({
          createdAt: { $gte: monthStart },
        });
      })(),

      // Category distribution
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalSold = soldStats.length > 0 ? soldStats[0].totalSold : 0;

    // Get featured products list (top 5)
    const featuredProductsList = await Product.find({ isFeatured: true })
      .select("product_name slug _id")
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        inStock,
        outOfStock,
        activeProducts,
        inactiveProducts,
        featuredProducts,
        totalSold,
        newThisMonth,
        categoryData,
        featuredProductsList,
      },
    });
  } catch (error) {
    console.error("Product stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product statistics",
    });
  }
});