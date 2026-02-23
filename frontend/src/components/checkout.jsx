import { useEffect, useState } from "react"
import './Checkout.css'
import { useParams, Link, useNavigate } from "react-router-dom"
import CartStore from "../store";
import { useForm } from "react-hook-form";
import AuthStore from "../AuthStore";
import Header from "./Navbar";
import api from "../Axios/Script";

function Checkout() {
    const { token } = AuthStore()
    const navigate = useNavigate();
    const { cart, clear } = CartStore();

    const totalAmount = cart.reduce((acc, item) => {
        const price = parseFloat(item.price);
        return acc + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
        if (cart.length === 0) {
            // navigate("/cart");
        }
    }, [cart, token, navigate]);

    const Upload = async (data) => {
        try {
            const orderData = {
                name: data.name,
                address: data.address,
                district: data.district,
                pincode: data.pincode,
                number: data.number,
                orderItems: cart.map(item => ({
                    pid: item.id,
                    qty: item.quantity
                })),
            };

            const res = await api.post("/order", orderData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 201) {
                reset();
                // We don't clear cart here because we need it for the summary on the payment page
                // Or we can pass the summary in state
                const orderId = res.data._id;
                navigate("/payment", {
                    state: {
                        orderId: orderId,
                        summary: cart,
                        totalAmount: totalAmount
                    }
                });
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Error: " + (err.response?.data?.error || err.message));
        }
    };

    if (cart.length === 0) {
        return (
            <>
                <Header />
                <div className="empty-checkout">
                    <div className="empty-visual">🛍️</div>
                    <h2>No Items to Checkout</h2>
                    <p>Your bag is empty. Add some products before checking out.</p>
                    <Link to="/" className="continue-btn">Go Shopping</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="checkout-page-wrapper">
                <div className="checkout-grid-container">

                    {/* Left: Shipping Details Form */}
                    <div className="shipping-details-section">
                        <div className="section-card">
                            <h2 className="section-title">Shipping Information</h2>
                            <form className="checkout-form" onSubmit={handleSubmit(Upload)}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        {...register("name", { required: "Name is required" })}
                                    />
                                    {errors.name && <span className="error-msg">{errors.name.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Delivery Address</label>
                                    <input
                                        type="text"
                                        placeholder="Flat, House no., Building, Company, Apartment"
                                        {...register("address", { required: "Address is required" })}
                                    />
                                    {errors.address && <span className="error-msg">{errors.address.message}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>District / City</label>
                                        <input
                                            type="text"
                                            placeholder="City"
                                            {...register("district", { required: "District is required" })}
                                        />
                                        {errors.district && <span className="error-msg">{errors.district.message}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input
                                            type="number"
                                            placeholder="6-digit Pincode"
                                            {...register("pincode", { required: "Pincode is required", minLength: 6 })}
                                        />
                                        {errors.pincode && <span className="error-msg">{errors.pincode.message}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="phone-input-wrapper">
                                        <span className="prefix">+91</span>
                                        <input
                                            type="number"
                                            placeholder="10-digit mobile number"
                                            {...register("number", { required: "Number is required", minLength: 10 })}
                                        />
                                    </div>
                                    {errors.number && <span className="error-msg">{errors.number.message}</span>}
                                </div>

                                <button type="submit" className="confirm-order-btn-main">
                                    Confirm and Place Order
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="order-summary-section">
                        <div className="summary-sticky-card">
                            <h2 className="section-title">Order Summary</h2>

                            <div className="checkout-items-list">
                                {cart.map(item => (
                                    <div key={item.id} className="checkout-item-mini">
                                        <div className="mini-img-box">
                                            <img src={item.image} alt={item.name} />
                                            <span className="mini-qty-badge">{item.quantity}</span>
                                        </div>
                                        <div className="mini-details">
                                            <p className="mini-name">{item.name}</p>
                                            <p className="mini-price">₹{(parseFloat(item.price) || 0) * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span className="free-tag">FREE</span>
                                </div>
                                <div className="total-row final">
                                    <span>Grand Total</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>

                            <p className="secure-badge">
                                🔒 Secure SSL Encrypted Checkout
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Checkout;