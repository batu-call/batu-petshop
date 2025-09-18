import express from 'express'
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors'
import fileUpload from 'express-fileupload';
import path from 'path';
import { dbConncetion } from './database/dbConncetion.js';
import os from 'os'
import userRouter from './Router/userRouter.js'
import productRouter from './Router/productRouter.js'
import cartRouter from './Router/cartRouter.js'
import orderRouter from './Router/orderRouter.js'
import adminRouter from './Router/adminRouter.js'
import couponRouter from './Router/couponRoutes.js'
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

    const app = express();
    config({path:"./Config/config.env"});



    //Cors
    const corsOptions = {
        origin:process.env.FRONTEND_URL,
        methods:["GET","POST","DELETE","PUT","OPTIONS"],
        credentials: true,
        optionsSuccessStatus: 200,
        allowedHeaders:['Content-Type','Authorization','X-Requested-With','Accept']
    }

     const corsOptionsAdmin= {
        origin:process.env.ADMIN_URL,
        methods:["GET","POST","DELETE","PUT","OPTIONS"],
        credentials: true,
        optionsSuccessStatus: 200,
        allowedHeaders:['Content-Type','Authorization','X-Requested-With','Accept']
    }


    


    app.use(cookieParser());
    app.use(express.json());
    //req.body
    app.use(express.urlencoded({extended: true}));
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
    app.use(fileUpload({
        useTempFiles:true,
        tempFileDir:os.tmpdir(),
        createParentPath:true,
    }))
    dbConncetion();


    app.use("/api/v1/user", cors(corsOptions), userRouter);
    app.use("/api/v1/admin", cors(corsOptionsAdmin), adminRouter);
    app.use("/api/v1/product",productRouter);
    app.use("/api/v1/cart",cartRouter);
    app.use("/api/v1/order",orderRouter);
    app.use("/api/v1/coupon",couponRouter);




    export default app;