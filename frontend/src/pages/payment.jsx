import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../Axios/Script";
import AuthStore from "../AuthStore";
import CartStore from "../store";
import "./Payment.css";

const Payment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { token } = AuthStore();
    const { clear } = CartStore();

    const [loading, setLoading] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [orderId, setOrderId] = useState(state?.orderId || null);
    const [summary, setSummary] = useState(state?.summary || []);
    const [totalAmount, setTotalAmount] = useState(state?.totalAmount || 0);

    useEffect(() => {
        // Load Cashfree SDK script dynamically
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (!orderId) {
            // If no order ID, redirect back to cart or home
            // navigate("/cart");
        }
    }, [orderId, navigate]);

    const handlePayment = async () => {
        if (!window.Cashfree) {
            alert("Cashfree SDK not loaded yet. Please wait a moment.");
            return;
        }

        if (!orderId) {
            alert("Order ID missing.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Payment Session via Backend
            const response = await api.post("/create-payment", { orderId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const cashfree = window.Cashfree({
                    mode: "sandbox", // Use "production" for live
                });

                const checkoutOptions = {
                    paymentSessionId: response.data.payment_session_id,
                    redirectTarget: "_modal", // Opens in a modal for better UX
                };

                // 2. Trigger Cashfree Checkout
                cashfree.checkout(checkoutOptions).then((result) => {
                    if (result.error) {
                        console.error("Payment error:", result.error);
                        alert("Payment failed: " + result.error.message);
                    } else if (result.redirect) {
                        console.log("Redirecting for payment...");
                    } else {
                        // Payment popup closed or completed
                        // We'll show our success UI if they finished
                        setPaymentDone(true);
                        clear(); // Clear cart now that payment is initiated/done
                    }
                });
            } else {
                alert("Failed to initialize payment: " + response.data.message);
            }
        } catch (err) {
            console.error("Payment initiation error:", err);
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/verify-payment/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                alert("Order verified and on its way!");
                navigate("/"); // Return to home page
            } else {
                alert("Verification failed: " + response.data.message);
                navigate("/"); // Still go home or let them retry
            }
        } catch (err) {
            console.error("Verification error:", err);
            alert("Verification Error: " + (err.response?.data?.message || err.message));
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h1>Complete Your Payment</h1>
                    <p>Choose your preferred payment method via Cashfree</p>
                </div>

                <div className="order-summary-mini">
                    <h3 className="summary-title">Order Summary</h3>
                    {summary.map((item, idx) => (
                        <div key={idx} className="summary-item">
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{parseFloat(item.price) * item.quantity}</span>
                        </div>
                    ))}
                    <div className="summary-total">
                        <span>Amount Payable</span>
                        <span>₹{totalAmount}</span>
                    </div>
                </div>

                <div className="payment-action">
                    <button
                        className="pay-button"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <>
                                <span>Secure Pay ₹{totalAmount}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                <div className="payment-footer" style={{ textAlign: 'center', paddingBottom: '20px', fontSize: '12px', color: '#94a3b8' }}>
                    🔒 Your payment is secured with 256-bit encryption
                </div>
            </div>

            {paymentDone && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="success-icon">🎉</div>
                        <h2>Payment Successful!</h2>
                        <p>Your payment has been received. Your delivery is already on the way!</p>
                        <button className="verify-btn" onClick={handleVerify} disabled={loading}>
                            {loading ? "Verifying..." : "Continue to Home"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
