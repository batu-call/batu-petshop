import mongoose from 'mongoose'


    export const ProductSchema = new mongoose.Schema({
        
        product_name : {
            type:String,
            trim:true,
            required:true,
        },
        
        description : {
            type:String,
            required:true,
        },

        price:{
            type:Number,
            required:true,
        },

        category:{
            type:String,
            required:true,
            enum:["Cat","Dog","Fish","Bird","Reptile","Rabbit","Horse"],
        },

        image : [
            {
                publicId : {
                    type:String,
                    required:true
                },

                url : {
                    type:String,
                    required:true,
                }
            }
        ],
    } , {
        timestamps: true
    })


    export const Product = mongoose.model("Product",ProductSchema)

    