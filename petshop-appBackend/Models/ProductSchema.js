import mongoose from "mongoose";
import slugify from "slugify";


export const SUB_CATEGORIES = {
  Cat:     ["Food", "Bed", "Toy", "Litter", "Accessory"],
  Dog:     ["Food", "Bed", "Toy", "Leash",  "Accessory"],
  Bird:    ["Food", "Cage", "Toy", "Accessory"],
  Fish:    ["Food", "Tank", "Filter", "Decoration"],
  Reptile: ["Food", "Habitat", "Lighting", "Accessory"],
  Rabbit:  ["Food", "Cage", "Toy", "Accessory"],
  Horse:   ["Food", "Saddle", "Care", "Accessory"],
};

const ALL_SUB_CATEGORIES = [...new Set(Object.values(SUB_CATEGORIES).flat())];

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

    // YENİ: Alt kategori
    subCategory: {
      type: String,
      enum: [...ALL_SUB_CATEGORIES, null],
      default: null,
      index: true,
    },

    image: [
      {
        publicId: { type: String, required: true },
        url:      { type: String, required: true },
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
          name:        { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      default: [
        {
          name: "Healthy and Well-Cared Animals",
          description: "Every animal offered for sale is raised with the utmost care ...",
        },
      ],
    },

    stock:      { type: Number,  default: 100 },
    isActive:   { type: Boolean, default: true },
    sold:       { type: Number,  default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function (next) {
  if (this.isNew && !this.slug) {
    this.slug = slugify(this.product_name, { lower: true, strict: true });
  }
  next();
});

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);