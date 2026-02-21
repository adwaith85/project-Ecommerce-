import express from "express";
import { createPayment, verifyPayment } from "../controller/payment.js";

const router = express.Router();

router.post("/create-payment", createPayment);
router.get("/verify-payment/:orderId", verifyPayment);

export default router;
