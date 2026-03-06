import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";
import { Order } from "../../Models/orderSchema.js";
import { Product } from "../../Models/ProductSchema.js";
import mongoose from "mongoose";
import crypto from "crypto";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeObjectId,
  sanitizeNumber,
  validateOrderItems,
  validateShippingAddress,
} from "../../utils/securityHelper.js";
import { sendOrderConfirmationMail } from "../mailController.js";

const verifyPriceMatch = (calculatedTotal, paidAmount, tolerance = 0.01) => {
  return Math.abs(calculatedTotal - paidAmount) <= tolerance;
};

export const stripeWebhook = catchAsyncError(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook configuration error");
  }

  let event;
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const paymentIntentId = sanitizeString(paymentIntent.id);

    console.log(`Payment succeeded webhook: ${paymentIntentId}`);

    const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntentId }).select("_id");
    if (existingOrder) {
      console.log(`Order already exists for payment: ${paymentIntentId}`);
      return res.json({ received: true, orderId: existingOrder._id });
    }

    let { userId, items, shippingAddress, shippingFee, idempotencyKey, couponCode, discountPercent } =
      paymentIntent.metadata;

    userId = sanitizeObjectId(userId);
    idempotencyKey = idempotencyKey ? sanitizeString(idempotencyKey) : undefined;

    if (!userId || !items || !shippingAddress) {
      console.error("Missing metadata in payment intent");
      return res.status(400).json({ error: "Missing order data in payment intent" });
    }

    let parsedItems, parsedShippingAddress;
    try {
      parsedItems = JSON.parse(items);
      parsedShippingAddress = JSON.parse(shippingAddress);
    } catch (parseError) {
      console.error("Failed to parse metadata:", parseError);
      return res.status(400).json({ error: "Invalid metadata format" });
    }

    try {
      validateOrderItems(parsedItems);
    } catch (error) {
      console.error("Invalid items in webhook:", error.message);
      return res.status(400).json({ error: error.message });
    }

    let sanitizedAddress;
    try {
      sanitizedAddress = validateShippingAddress(parsedShippingAddress);
    } catch (error) {
      console.error("Invalid shipping address in webhook:", error.message);
      return res.status(400).json({ error: error.message });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderItems = [];
      let calculatedTotal = 0;

      for (const item of parsedItems) {
        const productId = sanitizeObjectId(item.product);
        const quantity = sanitizeNumber(item.quantity, 1, 999);

        const product = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity, sold: quantity } },
          { new: true, session, select: "product_name price salePrice image" },
        );

        if (!product) {
          throw new Error(`Insufficient stock for product: ${sanitizeString(item.name)}`);
        }

        const actualPrice = product.salePrice ?? product.price;
        calculatedTotal += actualPrice * quantity;

        orderItems.push({
          product: product._id,
          name: product.product_name || sanitizeString(item.name) || "Unknown Product",
          price: actualPrice,
          quantity,
          image: product.image?.[0]?.url || "",
        });
      }

      const finalShippingFee = sanitizeNumber(shippingFee || 0, 0, 1000);

      let discountAmount = 0;
      const parsedDiscountPercent = parseFloat(discountPercent) || 0;
      if (parsedDiscountPercent > 0) {
        discountAmount = (calculatedTotal * parsedDiscountPercent) / 100;
      }

      const finalTotal = Math.max(calculatedTotal - discountAmount + finalShippingFee, 0);

      const paidAmount = paymentIntent.amount / 100;
      if (!verifyPriceMatch(finalTotal, paidAmount, 0.01)) {
        console.error(`Price mismatch: calculated ${finalTotal}, paid ${paidAmount}`);
        throw new Error("Payment amount does not match order total");
      }

      const orderData = {
        user: userId,
        items: orderItems,
        shippingAddress: sanitizedAddress,
        totalAmount: finalTotal,
        shippingFee: finalShippingFee,
        discountAmount,
        couponCode: couponCode || "",
        status: "paid",
        idempotencyKey: idempotencyKey || `webhook-${paymentIntentId}`,
        paymentResult: {
          id: paymentIntentId,
          status: "succeeded",
          email_address: sanitizedAddress.email,
        },
      };

      const { existing, order } = await Order.createOrderSafely(orderData, session);

      if (existing) {
        await session.abortTransaction();
        console.log(`Order already exists from webhook: ${order._id}`);
        return res.json({ received: true, orderId: order._id });
      }

      await session.commitTransaction();
      console.log(`✅ Order created from webhook: ${order._id}`);

      try {
        await sendOrderConfirmationMail({
          order: {
            _id: order._id,
            items: orderItems,
            shippingAddress: sanitizedAddress,
            totalAmount: finalTotal,
            shippingFee: finalShippingFee,
            discountAmount,
            couponCode: couponCode || "",
          },
          customerName: sanitizedAddress.fullName,
          customerEmail: sanitizedAddress.email,
        });
      } catch (mailError) {
        console.error("Webhook order confirmation email failed:", mailError.message);
      }

      return res.json({ received: true, orderId: order._id });
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Webhook order creation failed:", error.message);
      return res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }

  res.json({ received: true });
});

export const updateOrderToPaid = catchAsyncError(async (req, res, next) => {
  let orderId;
  try {
    orderId = sanitizeObjectId(req.params.id);
  } catch (error) {
    return next(new ErrorHandler("Invalid order ID", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.status === "paid") return next(new ErrorHandler("Order is already paid", 400));

  order.status = "paid";
  order.paymentResult = {
    id: req.body.id ? sanitizeString(req.body.id) : crypto.randomUUID(),
    status: req.body.status ? sanitizeString(req.body.status) : "succeeded",
    email_address: req.body.email_address
      ? sanitizeEmail(req.body.email_address)
      : order.shippingAddress.email,
  };

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, order: updatedOrder });
});