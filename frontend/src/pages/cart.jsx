import { useEffect } from "react";
import './Cart.css';
import CartStore from "../store";
import { Link, Navigate } from "react-router-dom";
import Header from "../components/Navbar";
import AuthStore from "../AuthStore";

function Cart() {
  const { cart, remove, add, decrease, clear } = CartStore();
  const { token } = AuthStore();

  const totalAmount = cart.reduce((acc, item) => {
    const price = parseFloat(item.price);
    return acc + (isNaN(price) ? 0 : price * item.quantity);
  }, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!token) return <Navigate to="/login" />;

  return (
    <>
      <Header />
      <div className="cart-page-wrapper">
        <div className="cart-container-main">
          {cart.length > 0 ? (
            <div className="cart-content-layout">
              <div className="cart-header">
                <h2>Shopping Bag ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
                <Link to="/" className="back-to-shop">
                  ← Continue Shopping
                </Link>
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="item-img-container">
                      <img
                        className="cart-item-image"
                        src={item.image}
                        alt={item.name}
                      />
                    </div>

                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <div className="item-meta">
                        <span className="cart-item-price">₹{item.price}</span>
                        <span className="dash">—</span>
                        <span className="item-subtotal">Subtotal: ₹{parseFloat(item.price) ? parseFloat(item.price) * item.quantity : 0}</span>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="qty-control-wrapper">
                        <button
                          className="qty-btn"
                          onClick={() => decrease(item.id)}
                        >
                          −
                        </button>
                        <input
                          type="text"
                          className="qty-input"
                          value={item.quantity}
                          readOnly
                        />
                        <button
                          className="qty-btn"
                          onClick={() => add(item)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={() => remove(item.id)}
                      >
                        <span className="trash-icon">🗑️</span> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="cart-bottom-bar">
                <div className="bottom-bar-content">
                  <div className="total-info">
                    <span className="total-label">Total Amount ({totalItems} items)</span>
                    <span className="total-value">₹{totalAmount}</span>
                  </div>
                  <Link to='/checkout' className="checkout-cta-btn">
                    Place Order Now
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-cart-container">
              <div className="empty-cart-visual">
                <div className="shopping-bag-icon">🎒</div>
              </div>
              <h2>Your Bag is Empty</h2>
              <p>Looks like you haven't added anything to your cart yet. Let's find something amazing for you!</p>
              <Link to="/" className="checkout-cta-btn empty-cart-btn">
                Start Exploring
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Cart;
