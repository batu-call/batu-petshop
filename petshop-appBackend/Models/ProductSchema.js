import mongoose from "mongoose";
import { type } from "os";
import slugify from "slugify";

export const ProductSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    salePrice: {
      type: Number,
      default: null,
    },

    category: {
      type: String,
      required: true,
      enum: ["Cat", "Dog", "Fish", "Bird", "Reptile", "Rabbit", "Horse"],
    },

    image: [
      {
        publicId: {
          type: String,
          required: true,
        },

        url: {
          type: String,
          required: true,
        },
      },
    ],

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    productFeatures: {
      type: [
        {
          name: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      default: [
        {
          name: "Healthy and Well-Cared Animals",
          description:
            "Every animal offered for sale is raised with the utmost care ...",
        },
      ],
    },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    sold: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function (next) {
  if (!this.isModified("product_name")) return next();
  this.slug = slugify(this.product_name, { lower: true, strict: true });
  next();
});

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
