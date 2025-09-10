import express from 'express'
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors'
import fileUpload from 'express-fileupload';
import { dbConncetion } from './database/dbConncetion.js';
import os from 'os'
import userRouter from './Router/userRouter.js'




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


    app.use(cors(corsOptions))
    app.use(cookieParser());
    app.use(express.json());
    //req.body
    app.use(express.urlencoded({extended: true}));
    app.use(fileUpload({
        useTempFiles:true,
        tempFileDir:os.tmpdir(),
        createParentPath:true,
    }))
    dbConncetion();


    app.use("/api/v1/user",userRouter);




    export default app;