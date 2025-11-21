import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import { Cart } from "../Models/CartSchema.js";
import { Product } from "../Models/ProductSchema.js";

export const addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId)
  if (!product) {
    return next(new ErrorHandler("Product not found!", 404));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
      discountCode: null,
      discountAmount: 0,
      shippingFee: 0,
    });
  }

  const itemIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity || 1;
  } else {
    cart.items.push({
      product: product._id,
      name: product.product_name,
      description: product.description, 
      price: product.price,
      quantity: quantity || 1,
      image: product.image?.[0]?.url || "",
      slug: product.slug,
    }); 
  }


  await cart.save();

  res.status(200).json({ success: true, cart });
});


  export const getCart = catchAsyncError(async(req,res,next) => {
    
    let cart = await Cart.findOne({user: req.user._id}).populate("items.product");

    if(!cart) {
      cart = await Cart.create({user: req.user._id});
    }

    res.status(200).json({
      success:true,
      cart
    })
  });


  export const removeFromCart = catchAsyncError(async(req,res,next) => {
    const {productId} = req.params;
    
    const cart = await Cart.findOne({user: req.user._id});

    if(!cart) {
      return next(new ErrorHandler("Cart Not Found!",404));
    }

    cart.items = cart.items.filter(item => item._id.toString() !== productId);

    await cart.save();

    res.status(200).json({
      success:true,
      cart
    })
  })





  export const removeAllCart = catchAsyncError(async(req,res,next) => {

    const cart = await Cart.findOne({user: req.user._id});


    if(!cart) {
      return next(new ErrorHandler('Cart Not Found!',400));
    }

      cart.items = [];

      await cart.save();

      res.status(200).json({
        success:true,
        message: "Cart cleared successfully!",
        cart
      })

  })


  export const updateQuantity = catchAsyncError(async(req,res,next) => {
    const {productId , quantity} = req.body;

    if(!quantity || quantity <= 0)  {
      return next(new ErrorHandler(`Invalid Quantity!`,400))
    }

    const cart = await Cart.findOne({user: req.user._id});

    if(!cart){
      return next(new ErrorHandler(`Cart Not Found!`,400));
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    
    if(!item ) {
      return next(new ErrorHandler(`Product no in cart!`,400))
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success:true,
      cart
    })
  })