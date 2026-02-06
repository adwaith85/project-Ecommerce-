import dotenv from "dotenv"

import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import Product from "./model/productmodel.js"

import CategoryROute from "./route/category.js"
import ProductRoute from "./route/product.js"
import AuthROute from "./route/auth.js"
import cateItemROute from "./route/cateItem.js"

import OrderRouter from "./route/order.js"

dotenv.config()
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/ecommerce"
const PORT = process.env.PORT || 8000


const app = express()
mongoose
    .connect(MONGO_URL)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log("DB Connection Error:", err));

app.use(express.json())
app.use(cors({
    origin: "http://107.23.144.232",
    credentials: true
}))
app.use('/uploads', express.static('uploads'));

const items = []

app.use(ProductRoute)

app.use(AuthROute)

app.use(CategoryROute)

app.use(cateItemROute)
app.use(OrderRouter)

// Error handler to return JSON instead of HTML
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);

    // Handle Multer specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: "File too large",
            message: "The profile image size must be less than 10MB."
        });
    }

    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => console.log(`running on ${PORT}`))