import {catchAsyncError} from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import {Order} from "../Models/orderSchema.js";

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorHandler("No Order Items!", 400));
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,   
    paymentMethod,
    totalPrice,
    status:"pending",
  });

  res.status(201).json({
    success: true,
    order,
  });
});

export const getOrder = catchAsyncError(async(req,res,next)=>{
    
    const order = await Order.findById(req.params.id).populate("user","name email")

    if(!order) {
        return next(new ErrorHandler("Order Not Found!",400));
    }

    res.status(200).json({
        success:true,
        order
    })
})


export const getUserOrder = catchAsyncError(async(req,res,next) => {
        const order = await Order.find({user:req.user._id})

        res.status(200).json({
            success:true,
            order
        })
})


// update toPaid
export const updateOrderToPaid = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler("Order Not Found!",400));
    }

    order.status = "paid";
    order.paymentResult = {
        id:req.body.id,
        status:req.body.status,
        updateTimes:req.body.updateTimes,
        email_address:req.body.email_address
    }

    const updateOrder = await order.save();


    res.status(200).json({
        success:true,
        updateOrder 
    })

})


 export const updateOrderStatus = catchAsyncError(async(req,res,next) => {

        const order  = await Order.findById(req.body.id)

        if(!order){
            return next(new ErrorHandler("Order Not Found!"),400)
        }

        order.status = req.body.status;
        const updateOrder = await order.save();
 
        res.status(200).json({
            success:true,
            updateOrder
        })
    })
