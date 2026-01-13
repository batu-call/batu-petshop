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

  if (!req.file) {
    return next(new ErrorHandler("Please upload an image", 400));
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

  // Cloudinary

  const result = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Products",
  });

  //Remove
  fs.unlinkSync(req.file.path);

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
    isActive: isActive ?? true,
    isFeatured: isFeatured ?? false,
    sold: 0,
    image: [
      {
        publicId: result.public_id,
        url: result.secure_url,
      },
    ],
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
    return next(new ErrorHandler("Product Not Found!"), 404);
  }

  for (const image of product.image) {
    await cloudinary.v2.uploader.destroy(image.publicId);
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProduct = catchAsyncError(async (req, res, next) => {
  const { category,page=1 } = req.query;
  const limit  = 15;
  const skip = (Number(page) - 1) * limit;

  let filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  const totalProducts = await Product.countDocuments(filter);
  const products = await Product.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    products: updatedProducts,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: Number(page),
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
  const { category } = req.query;

  let filter = {};

  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });

  const updatedProducts = products.map((p) => ({
    ...p._doc,
    slug: p.slug || slugify(p.product_name, { lower: true, strict: true }),
  }));

  res.status(200).json({
    success: true,
    products: updatedProducts,
  });
});

export const getProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!product) {
    return next(new ErrorHandler("Product Not Found!"), 404);
  }

  res.status(200).json({
    success: true,
    product,
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
    $or: [
      { isFeatured: true },
      { salePrice: { $ne: null } },
    ],
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

export const getAdminProductBySlug = catchAsyncError(async (req, res, next) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug });

  if (!product) {
    return next(new ErrorHandler("Product Not Found!", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

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
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (salePrice !== null && salePrice !== undefined) {
      if (Number(salePrice) >= Number(price)) {
        return res.status(400).json({
          success: false,
          message: "Sale price must be lower than price",
        });
      }
    }

    product.product_name = product_name ?? product.product_name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.salePrice =
      salePrice === null || salePrice === undefined ? null : Number(salePrice);
    product.productFeatures = productFeatures ?? product.productFeatures;
    product.stock = stock ?? product.stock;
    product.isActive = isActive ?? product.isActive;
    product.isFeatured = isFeatured ?? product.isFeatured;

    if (product_name) {
      const baseSlug = slugify(product_name, { lower: true, strict: true });
      product.slug = `${baseSlug}-${nanoid(6)}`;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

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
