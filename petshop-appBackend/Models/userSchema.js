import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' 
   


    export const userSchema = mongoose.Schema({
        
        firstName : {
            type:String,
            required:true,
            minLength:[
                3,"First Name Must Contain At Least 3 Characters!"
            ],
            maxLength : [30, "First Name must not exceed 30 characters!"],
            trim: true,
        },

        lastName : {
            type : String,
            required: true,
            minLength: [3,"Last Name Must Contain At Least 3 Characters!"],
            maxLength : [30, "First Name must not exceed 30 characters!"],
            trim: true,
        },
        email :{
            type:String,
            required:true,
            validate:[
                validator.isEmail, "Please Provide A Valid Email!"
            ]
        },
        phone: {
            type:String,
            required:true,
            minLength:[
                11, "Phone Number Must Contain Extact 11 Digits!"
            ],
            maxLength:[
                11, "Phone Number Must Contain Extact 11 Digits!"
            ]
        } ,
        password : {
            type:String,
            required:true,
            minLength:[
                8, "Password Must Contain At Least 8 Characters!"
            ],
            select:false
        },
        address: {
            type:String,
            required:true,
            minLength: [12, "Address must be at least 12 characters long!"],
            trim: true,
        },
        
        avatar: {
            type:String,
            default:"https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
        },
         role:{
            type:String,
            enum:["Admin","User"],
            default:"User",
        }
        
    },{timestamps:true})
    //hash
    userSchema.pre("save",async function (next){
        if(!this.isModified("password")){
            next()
        }
        this.password = await bcrypt.hash(this.password, 10)
        next();
            });

            //compare password
            userSchema.methods.comparePassword = async function (enteredPassword) {
                return await bcrypt.compare(enteredPassword,this.password)
            };

            // jwt 
            userSchema.methods.generateJsonWebToken = function (){
                return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY,{
                    expiresIn: process.env.JWT_EXPIRES,
                });
    }

    export const User = mongoose.model("User",userSchema);