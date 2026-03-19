import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ShippingContent from "../Models/ShippingContentSchema.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";

export const getShippingContent = catchAsyncError(async (req, res, next) => {
  const content = await ShippingContent.findOne({ type: "main" });
  res.status(200).json({ success: true, data: content || null });
});

export const updateShippingContent = catchAsyncError(async (req, res, next) => {
  const { sections } = req.body;

  if (!sections || !Array.isArray(sections)) {
    return next(new ErrorHandler("sections zorunlu ve dizi olmalıdır", 400));
  }

  const isValid = sections.every(
    (section) =>
      typeof section.title === "string" &&
      section.title.trim() !== "" &&
      Array.isArray(section.items)
  );

  if (!isValid) {
    return next(
      new ErrorHandler(
        "Her section 'title' (string) ve 'items' (dizi) içermelidir",
        400
      )
    );
  }

  const content = await ShippingContent.findOneAndUpdate(
    { type: "main" },
    { $set: { sections } },
    { new: true, upsert: true }
  );

  res.status(200).json({ success: true, data: content });
});