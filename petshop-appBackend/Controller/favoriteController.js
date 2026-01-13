import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import Favorite from "../Models/favoriteSchema.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";

export const addFavorite = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;


  const exist = await Favorite.findOne({ userId, productId });
  if (exist) {
    return next(new ErrorHandler("Already favorited", 400));
  }

  const favorite = await Favorite.create({ userId, productId });

  res.status(201).json({
    success: true,
    favorite,
  });
});

export const removeFavorite = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const favorite = await Favorite.findOneAndDelete({ userId, productId });

  if (!favorite) {
    return next(new ErrorHandler("Favorite not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Removed from favorites",
  });
});


export const getFavorite = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const favorites = await Favorite.find({ userId }).populate({
    path: "productId",
    match: {
      $or: [
        { isActive: true },
        { isActive: { $exists: false } },
      ],
    },
    select: "product_name price salePrice description image slug",
  });

  const favoriteProducts = favorites
    .filter((fav) => fav.productId) 
    .map((fav) => fav.productId);

  res.status(200).json({
    success: true,
    favorites: favoriteProducts,
  });
});