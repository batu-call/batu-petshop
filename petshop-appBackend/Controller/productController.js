import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { Product } from "../Models/ProductSchema.js";
import ErrorHandler from "../Middlewares/errorMiddleware.js";
import cloudinary from 'cloudinary'
import fs from 'fs'



    export const newProduct = catchAsyncError(async(req,res,next) => {
        const {product_name,description,price,category} = req.body;
        
        if(!req.file) {
            return next(new ErrorHandler("Please upload an image"),400);
        }

        if(
            !product_name || 
            !description ||
            !price ||
            !category
        ) {
            return next(new ErrorHandler("Please Fill Full Form!" , 400))
        }
            
         // Cloudinary 
            
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "Products",
        });

        //Remove 
        fs.unlinkSync(req.file.path);


        const product = await Product.create({
            product_name,
            description,
            price,
            category,
            image : [{
                publicId:result.public_id,
                url:result.secure_url,
            }]
        });

        res.status(201).json({
            success:true,
            message:"Product created successfully",
            product
        })
    })


    export const deleteProduct = catchAsyncError(async(req,res,next)=>{
        const {productId} = req.params;

        const product = await Product.findById(productId);

        if(!product) {
            return next(new ErrorHandler("Product Not Found!"),404)
        }

        for(const image of product.image){
            await cloudinary.v2.uploader.destroy(image.publicId)
        }

        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            success:true,
            message:"Product Deleted Successfully"
        })
    })



    export const getAllProduct = catchAsyncError(async(req,res,next)=> {

        const products = await Product.find();

        res.status(200).json({
            success:true,
            products
        })
    })

    export const getProduct = catchAsyncError(async(req,res,next)=>{
        
        const product  = await Product.findById(req.params.id);

        if(!product ) {
            return next(new ErrorHandler("Product Not Found!"),404)
        }

        res.status(200).json({
            success:true,
            product 
        })
    });

    export const getLatestProduct = catchAsyncError(async(req,res,next) => {
        const products = await Product.find().sort({ createAt : -1}).limit(10);

        res.status(200).json({
            success : true,
            products
        })
    }) 

    