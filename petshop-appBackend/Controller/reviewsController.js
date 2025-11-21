import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import  { Review }  from "../Models/reviewsSchema.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";

export const addReviews = catchAsyncError(async (req, res, next) => {
  const { productId, comment, rating } = req.body;


    //User
    const userId = req.user._id

  const review = await Review.create({
    userId,
    productId,
    comment,
    rating,
  });

  res.status(200).json({
    success: true,
    message: "Successfully",
    review,
  });
});


export const getReviews = catchAsyncError(async(req,res,next) => {
    const review = await Review.find({productId:req.params.productId}).populate("userId", "firstName lastName email");


    res.status(200).json({
        success:true,
        message:"Successfuly",
        review
    })
    
})


export const deleteReviews = catchAsyncError(async(req,res,next) =>{
    const { id } = req.params;

    const review = await Review.findById(id);



    if(req.user.role !== "Admin" && review.userId.toString() !== req.user._id.toString()){
        return next(new ErrorHandler("You are not authorized to delete this review."),403)
    }


    await review.deleteOne();

     res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
})


