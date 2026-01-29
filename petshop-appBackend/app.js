import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";

import { dbConncetion } from "./database/dbConncetion.js";

import userRouter from "./Router/userRouter.js";
import productRouter from "./Router/productRouter.js";
import cartRouter from "./Router/cartRouter.js";
import orderRouter from "./Router/orderRouter.js";
import adminRouter from "./Router/adminRouter.js";
import analyticsRouter from "./Router/analyticsRouter.js";
import reviewsRouter from "./Router/reviewsRouter.js";
import favoriteRouter from "./Router/favoriteRouter.js";
import couponRouter from "./Router/couponRoutes.js";
import shippingRouter from "./Router/shippingRouter.js";
import messageRouter from "./Router/messageRouter.js";
import mailRouter from "./Router/mailRouter.js";

import { errorMiddleware } from "./Middlewares/errorMiddleware.js";

const app = express();

/* =======================
   ENV
======================= */
config({ path: "./Config/config.env" });

/* =======================
   CORS (MOBİL + COOKIE SAFE)
======================= */
const allowedOrigins = [
  "https://batu-petshop-app.vercel.app",
  "https://batu-petshop-admin.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Mobile Safari / Postman / SSR
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❗ Error fırlatma → mobilde network error yapar
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(cors(corsOptions));

/* =======================
   BODY & COOKIE
======================= */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   PREFLIGHT FIX (Node 20 SAFE)
======================= */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

/* =======================
   DATABASE
======================= */
dbConncetion();

/* =======================
   ROUTES
======================= */
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/favorite", favoriteRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/shipping", shippingRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/mail", mailRouter);

/* =======================
   ERROR HANDLER
======================= */
app.use(errorMiddleware);

export default app;
