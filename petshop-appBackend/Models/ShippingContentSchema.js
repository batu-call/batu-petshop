import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [itemSchema],
});

const shippingContentSchema = new mongoose.Schema(
  {
    type: { type: String, default: "main", unique: true },
    sections: [sectionSchema],
  },
  { timestamps: true },
);

const ShippingContent = mongoose.model("ShippingContent", shippingContentSchema);
export default ShippingContent;