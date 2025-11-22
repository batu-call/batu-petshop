import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors';
import { dbConncetion } from './database/dbConncetion.js';
import userRouter from './Router/userRouter.js';
import productRouter from './Router/productRouter.js';
import cartRouter from './Router/cartRouter.js';
import orderRouter from './Router/orderRouter.js';
import adminRouter from './Router/adminRouter.js';
import analyticsRouter from './Router/analyticsRouter.js';
import reviewsRouter from './Router/reviewsRouter.js';

const app = express();

// Environment variables
config({ path: './Config/config.env' });



// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  process.env.ADMIN_URL    
];

const corsOptions = {
  origin: function(origin, callback) {
    console.log("Request origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET","POST","DELETE","PUT","OPTIONS"],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept']
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
dbConncetion();

// Routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/reviews", reviewsRouter);


export default app;
