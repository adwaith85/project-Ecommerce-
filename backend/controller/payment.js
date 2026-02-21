import Order from "../model/order.js";
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const createPayment = async (req, res) => {
    try {
        const { orderId, order_id, id } = req.body;
        const actualOrderId = orderId || order_id || id;

        console.log("Initiating payment for Order ID:", actualOrderId);

        if (!actualOrderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID (orderId) is required in the request body."
            });
        }

        // Fetch order details from MongoDB
        // We populate userId to get the customer's secondary details if needed
        const order = await Order.findById(actualOrderId).populate("userId");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with the provided ID",
                receivedId: actualOrderId
            });
        }

        // Sanitize phone number for Cashfree (it expects 10 digits or specific format)
        // Your current order has "1474101236963" which is too long.
        let phone = order.number || order.userId?.number || "9999999999";
        phone = phone.replace(/\D/g, ''); // Remove non-digits

        // Handle common Indian number formats (remove 91 or +91 if present and length > 10)
        if (phone.length > 10) {
            phone = phone.slice(-10); // Take last 10 digits
        }

        // Prepare Cashfree request data
        const options = {
            method: 'POST',
            url: 'https://sandbox.cashfree.com/pg/orders',
            headers: {
                accept: 'application/json',
                'x-client-id': process.env['x-client-id'],
                'x-client-secret': process.env['x-client-secret'],
                'x-api-version': '2023-08-01',
                'content-type': 'application/json'
            },
            data: {
                customer_details: {
                    customer_id: order.userId?._id?.toString() || order.userId?.toString() || "cust_" + actualOrderId,
                    customer_name: order.name || "Customer",
                    customer_email: order.userId?.email || "customer@gmail.com",
                    customer_phone: phone
                },
                order_amount: order.TotalPrice,
                order_currency: 'INR',
                order_id: order._id.toString()
            }
        };

        const response = await axios.request(options);

        // Store the new cf_order_id from Cashfree response into our Order model
        // This is crucial for later verification
        order.cf_order_id = response.data.cf_order_id;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Payment initiated with Cashfree",
            cf_order_id: response.data.cf_order_id,
            payment_session_id: response.data.payment_session_id, // Important for frontend SDK
            order_data: response.data
        });

    } catch (error) {
        console.error("Cashfree API Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create Cashfree payment order",
            error: error.response?.data || error.message
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        let order;
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            order = await Order.findById(orderId);
        } else {
            order = await Order.findOne({ cf_order_id: orderId });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found in our database"
            });
        }

        // Check if cf_order_id exists. If not, payment was never initiated.
        if (!order.cf_order_id) {
            return res.status(400).json({
                success: false,
                message: "Payment was never initiated for this order (cf_order_id is missing). Please call create-payment first."
            });
        }

        console.log("Verifying payment for Order:", order._id.toString(), "CF ID:", order.cf_order_id);

        const options = {
            method: 'GET',
            url: `https://sandbox.cashfree.com/pg/orders/${order._id.toString()}/payments`,
            headers: {
                accept: 'application/json',
                'x-client-id': process.env['x-client-id'],
                'x-client-secret': process.env['x-client-secret'],
                'x-api-version': '2023-08-01'
            }
        };

        const response = await axios.request(options);

        // Find a successful payment record from Cashfree response
        const successPayment = response.data.find(payment => payment.payment_status === "SUCCESS");

        if (successPayment) {
            // Update all requested fields
            order.paymentStatus = "Paid";
            order.paymentMethod = "Online";
            order.status = "On the way"; // Update status as requested
            order.paidAt = new Date();

            await order.save();

            res.status(200).json({
                success: true,
                message: "Payment successful. Order updated to 'On the way'.",
                order
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment not successful yet or pending. If you just paid, please wait a moment.",
                payments: response.data
            });
        }
    } catch (error) {
        console.error("Verification Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to verify payment with Cashfree",
            error: error.response?.data || error.message
        });
    }
};
