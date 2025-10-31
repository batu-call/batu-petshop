import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import os from 'os';

import { dbConncetion } from './database/dbConncetion.js';
import userRouter from './Router/userRouter.js';
import productRouter from './Router/productRouter.js';
import cartRouter from './Router/cartRouter.js';
import orderRouter from './Router/orderRouter.js';
import adminRouter from './Router/adminRouter.js';

const app = express();

// Environment variables
config({ path: './Config/config.env' });

// CORS Options
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

const corsAdminOptions = {
    origin: process.env.ADMIN_URL,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Middleware
app.use(cors(corsOptions)); //Frontend
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
    createParentPath: true
}));

// Database connection
dbConncetion();

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", cors(corsAdminOptions), adminRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);

export default app;
