import mongoose from "mongoose";
import { type } from "os";



    export const CartSchema = new mongoose.Schema({
        user : {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true,
        },

        items:[
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },

            name:{
                type:String,
                required:true,
            },
            price:{
                type:Number,
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            image:{
                type:String,
            },
            slug:{
                type:String,
            },
            }
        ],
        totalItems:{
            type:Number,
            required:true,
            default:0
        },

        subTotal:{
            type:Number,
            required:true,
            default:0
        },

        discountCode:{
            type:String,
            default:null
        },
        discountAmount:{
            type:Number,
            default:0,
        },
        shippingFee:{
            type:Number,
            default:0
        },

        totalAmount:{
            type:Number,
            required:true,
            default:0
        },

    },{timestamps:true});

    CartSchema.pre("save",function(next) {
        let totalItems = 0;
        let subTotal = 0;

        this.items.forEach((item)  => {
            totalItems += item.quantity;
            subTotal += item.price * item.quantity;
        });
        this.totalItems = totalItems;
        this.subTotal = subTotal;
        this.totalAmount = subTotal + this.shippingFee - this.discountAmount;

        next();
    });





    export const Cart = mongoose.model("Cart",CartSchema)