import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    pid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    qty: {
        type: Number,
        required: true
    }
})
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    name: {
        type: String
    },
    address: {
        type: String
    },

    district: {
        type: String
    },
    pincode: {
        type: String
    },
    number: {
        type: String
    },
    orderItems: {
        type: [OrderItemSchema],
        required: true
    },
    TotalPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ["Pending", "On the way", "Delivered", "Cancelled"],
        default: "Pending"
    },
    paymentStatus: {
        type: String,
        enum: ["Paid", "Not Paid"],
        default: "Not Paid"
    },
    paymentMethod: {
        type: String,
        enum: ["Online", "Offline"],
        default: "Offline"
    },
    paidAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    cf_order_id: {
        type: String
    }

}, { timestamps: true });

const Order = mongoose.model("order", orderSchema);
export default Order
