import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { Cart } from "../Models/CartSchema.js";
import { Product } from "../Models/ProductSchema.js";


const calculateCartTotals = (cart) => {
  const subtotal = cart.items.reduce((acc, item) => {
    const price =
      item.product?.salePrice ?? item.product?.price ?? 0;

    return acc + price * item.quantity;
  }, 0);

  let discountAmount = 0;

  if (cart.appliedCoupon?.percent > 0) {
    discountAmount = (subtotal * cart.appliedCoupon.percent) / 100;
  }

  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
  };
};


export const addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (quantity < 1) {
    return next(new ErrorHandler("Invalid quantity", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      appliedCoupon: null,
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
    });
  }

  await cart.save();

  await cart.populate(
    "items.product",
    "product_name price salePrice image slug"
  );

  const totals = calculateCartTotals(cart);

  res.status(200).json({
    success: true,
    cart,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    total: totals.total,
  });
});


export const getCart = catchAsyncError(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "product_name description price  salePrice image slug");

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      appliedCoupon: null,
    });
  }

  const totals = calculateCartTotals(cart);

  res.status(200).json({
    success: true,
    cart,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    total: totals.total,
  });
});


export const updateQuantity = catchAsyncError(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    return next(new ErrorHandler("Invalid quantity", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "price salePrice");

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  const item = cart.items.find(
    (item) => item.product._id.toString() === productId
  );

  if (!item) {
    return next(new ErrorHandler("Product not in cart", 404));
  }

  item.quantity = quantity;
  await cart.save();

  const totals = calculateCartTotals(cart);

  res.status(200).json({
    success: true,
    cart,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    total: totals.total,
  });
});


export const removeFromCart = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "price salePrice");

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  cart.items = cart.items.filter(
    (item) => item.product._id.toString() !== productId
  );

  if (cart.items.length === 0) {
    cart.appliedCoupon = null;
  }

  await cart.save();

  const totals = calculateCartTotals(cart);

  res.status(200).json({
    success: true,
    cart,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    total: totals.total,
  });
});


export const clearCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  cart.items = [];
  cart.appliedCoupon = null;
  await cart.save();

  res.status(200).json({
    success: true,
    cart,
    subtotal: 0,
    discountAmount: 0,
    total: 0,
  });
});


export const removeCoupon = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "price salePrice");

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  if (!cart.appliedCoupon) {
    return next(new ErrorHandler("No coupon applied", 400));
  }

  cart.appliedCoupon = null;
  await cart.save();

  const totals = calculateCartTotals(cart);

  res.status(200).json({
    success: true,
    cart,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    total: totals.total,
  });
});
