import mongoose, { mongo } from "mongoose";

export const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        user: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: String,
          required: true,
        },
        images: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
      },

      city: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["credit_card", "cash_on_delivery", "paypal", "stripe"],
      required: true,
    },

    paymentResult: {
      id: String,
      status: String,
      updateTimes: String,
      email_address: String,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timesTamps: true }
);


    export const Order = mongoose.model("Order",orderSchema)
