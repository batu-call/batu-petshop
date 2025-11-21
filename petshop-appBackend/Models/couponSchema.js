import mongoose from "mongoose";


     const couponSchema = new mongoose.Schema({
        code: {
            type:String,
            required:true,
            unique:true,
            trim:true,
            uppercase:true,
        },
        type:{
            type:String,
            enum:["percentage","fixed"],
            required:true
        },
        value:{
            type:Number,
            required:true
        },
        appliesTo:{
            type:String,
            default:"all"
        },
        usedCount:{
            type:Number,
            default:0
        },
        validFrom:{
            type:Date,
            default:Date.now
        },
        validUntil:{
            type:Date
        },
        status:{
            type:Boolean,
            default:true
        }
    },{timestamps:true});


    export default mongoose.model("Coupon",couponSchema)