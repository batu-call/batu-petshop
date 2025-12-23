import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { Review } from "../Models/reviewsSchema.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";

export const addReviews = catchAsyncError(async (req, res, next) => {
  const { productId, comment, rating } = req.body;
  const userId = req.user._id;



  let review = await Review.create({
    userId,
    productId,
    comment,
    rating,
    helpful: [],
  });

  review = await review.populate("userId", "firstName lastName avatar");

  res.status(200).json({
    success: true,
    message: "Successfully",
    review,
  });
});


export const getReviews = catchAsyncError(async (req, res, next) => {
  const reviews = await Review.find({ productId: req.params.productId })
    .populate("userId", "firstName lastName avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Successfuly",
    reviews,
  });
});

export const deleteReviews = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  if (
    req.user.role !== "Admin" &&
    review.userId.toString() !== req.user._id.toString()
  ) {
    return next(
      new ErrorHandler("You are not authorized to delete this review."),
      403
    );
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

export const getUserReviews = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;

  const reviews = await Review.find({ userId })
    .populate("productId", "name price image")
    .populate("userId", "firstName lastName email avatar");

  res.status(200).json({
    success: true,
    message: "User reviews fetched successfully",
    reviews,
  });
});

export const adminDeleteReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("You are not authorized", 403));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted by admin successfully!",
  });
});




export const getAllReviewsCount = catchAsyncError(async (req, res, next) => {
  const result = await Review.aggregate([
    {
      $group: {
        _id: "$productId",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {};
  result.forEach((item) => {
    counts[item._id.toString()] = item.count;
  });

  res.status(200).json({
    success: true,
    counts,
  });
});

export const toggleHelpful = catchAsyncError(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  const userId = req.user._id;

  const index = review.helpful.indexOf(userId);

  if (index === -1) {
    review.helpful.push(userId);
  } else {
    review.helpful.splice(index, 1);
  }

  await review.save();

 res.status(200).json({
  success: true,
  helpful: review.helpful,
});
});