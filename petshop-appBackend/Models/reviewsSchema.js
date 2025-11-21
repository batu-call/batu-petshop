import mongoose from 'mongoose'

    export const reviewsSchema = new mongoose.Schema({
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        comment : {
            type: String,
            required:true
        },
        rating : {
            type: Number,
            min:1,
            max:5,
            required:true
        },
        createdAt : { 
            type:Date,
            default:Date.now
        }
    })

    export const Review =  mongoose.model("Review",reviewsSchema); 