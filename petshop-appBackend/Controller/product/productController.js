import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import { Product, SUB_CATEGORIES } from "../../Models/ProductSchema.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import { nanoid } from "nanoid";
import {
  sanitizeString,
  sanitizeObjectId,
  sanitizeNumber,
  sanitizeBoolean,
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

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ publicId: result.public_id, url: result.secure_url });
      },
    );
    stream.end(buffer);
  });
};

const validateSubCategory = (category, subCategory) => {
  if (!subCategory || subCategory === "null" || subCategory === "") return null;
  const validSubs = SUB_CATEGORIES[category] || [];
  const sanitized = sanitizeString(subCategory);
  return validSubs.includes(sanitized) ? sanitized : null;
};

export const newProduct = catchAsyncError(async (req, res, next) => {
  const {
    product_name,
    description,
    price,
    category,
    subCategory,
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

  let uploadedImages;
  try {
    uploadedImages = await Promise.all(
      req.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, "Products"),
      ),
    );
  } catch (error) {
    return next(
      new ErrorHandler("Failed to upload images to cloud storage", 500),
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

  const sanitizedName = sanitizeString(product_name);
  const sanitizedDesc = sanitizeString(description);
  const sanitizedCategory = sanitizeString(category);

  let validatedPrice;
  try {
    validatedPrice = sanitizeNumber(price, 0.01, 1000000);
  } catch (error) {
    return next(new ErrorHandler("Invalid price", 400));
  }

  let validatedStock;
  try {
    validatedStock = stock ? sanitizeNumber(stock, 0, 100000) : 100;
  } catch (error) {
    return next(new ErrorHandler("Invalid stock value", 400));
  }

  const baseSlug = slugify(sanitizedName, { lower: true, strict: true });
  const uniqueSlug = `${baseSlug}-${nanoid(6)}`;

  const validatedSubCategory = validateSubCategory(
    sanitizedCategory,
    subCategory,
  );

  const product = await Product.create({
    product_name: sanitizedName,
    description: sanitizedDesc,
    price: validatedPrice,
    category: sanitizedCategory,
    subCategory: validatedSubCategory,
    stock: validatedStock,
    isActive: isActive === "true" || isActive === true,
    isFeatured: isFeatured === "true" || isFeatured === true,
    sold: 0,
    image: uploadedImages,
    slug: uniqueSlug,
    productFeatures: parseFeatures,
  });

  res
    .status(201)
    .json({ success: true, message: "Product created successfully", product });
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  let productId;
  try {
    productId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid product ID", 400));
  }

  const product = await Product.findById(productId);
  if (!product) return next(new ErrorHandler("Product Not Found!", 404));

  await Promise.all(
    product.image.map((img) => cloudinary.uploader.destroy(img.publicId)),
  );
  await Product.findByIdAndDelete(productId);

  res
    .status(200)
    .json({ success: true, message: "Product Deleted Successfully" });
});

export const deleteProductImage = catchAsyncError(async (req, res, next) => {
  const { productId, imageId } = req.params;
  const { publicId } = req.body;

  if (!publicId) return next(new ErrorHandler("Public ID is required", 400));

  let validProductId, validImageId;
  try {
    validProductId = sanitizeObjectId(productId);
    validImageId = sanitizeObjectId(imageId);
  } catch (error) {
    return next(new ErrorHandler("Invalid ID format", 400));
  }

  const product = await Product.findById(validProductId);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  if (product.image.length <= 1)
    return next(new ErrorHandler("Product must have at least one image", 400));

  try {
    await cloudinary.uploader.destroy(sanitizeString(publicId));
  } catch (error) {
    return next(new ErrorHandler("Failed to delete image from cloud", 500));
  }

  product.image = product.image.filter(
    (img) => img._id.toString() !== validImageId,
  );
  await product.save();

  res
    .status(200)
    .json({ success: true, message: "Image deleted successfully", product });
});

export const updateProductController = async (req, res) => {
  try {
    let productId;
    try {
      productId = sanitizeObjectId(req.params.id);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

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
      subCategory,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const finalPrice = price
      ? sanitizeNumber(price, 0.01, 1000000)
      : product.price;

    if (
      salePrice &&
      salePrice !== "" &&
      salePrice !== "null" &&
      salePrice !== "undefined"
    ) {
      const salePriceNum = sanitizeNumber(salePrice, 0.01, 1000000);
      if (salePriceNum >= finalPrice) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Sale price must be lower than price",
          });
      }
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadedImages = await Promise.all(
          req.files.map((file) =>
            uploadBufferToCloudinary(file.buffer, "Products"),
          ),
        );
        product.image.push(...uploadedImages);
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload images" });
      }
    }

    if (product_name && product_name !== product.product_name)
      product.product_name = sanitizeString(product_name);
    if (description !== undefined && description !== null)
      product.description = sanitizeString(description);

    if (price !== undefined && price !== null && price !== "") {
      try {
        product.price = sanitizeNumber(price, 0.01, 1000000);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid price value" });
      }
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
      try {
        product.salePrice = sanitizeNumber(salePrice, 0.01, 1000000);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid sale price value" });
      }
    }

    if (productFeatures !== undefined && productFeatures !== null) {
      try {
        product.productFeatures =
          typeof productFeatures === "string"
            ? JSON.parse(productFeatures)
            : productFeatures;
      } catch (err) {
        /* malformed, skip */
      }
    }

    if (stock !== undefined && stock !== null && stock !== "") {
      try {
        product.stock = sanitizeNumber(stock, 0, 100000);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid stock value" });
      }
    }

    if (isActive !== undefined && isActive !== null) {
      const active = sanitizeBoolean(isActive);
      if (active !== null) product.isActive = active;
    }

    if (isFeatured !== undefined && isFeatured !== null) {
      const featured = sanitizeBoolean(isFeatured);
      if (featured !== null) product.isFeatured = featured;
    }

    if (category && category !== null && category !== "") {
      const sanitizedCategory = sanitizeString(category);
      if (VALID_CATEGORIES.includes(sanitizedCategory)) {
        product.category = sanitizedCategory;

        const newSub = validateSubCategory(
          sanitizedCategory,
          subCategory ?? product.subCategory,
        );
        product.subCategory = newSub;
      }
    } else if (subCategory !== undefined) {
      product.subCategory = validateSubCategory(product.category, subCategory);
    }

    await product.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        product,
      });
  } catch (error) {
    console.error("Update product error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating product",
        error: error.message,
      });
  }
};
