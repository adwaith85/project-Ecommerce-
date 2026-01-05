import { useEffect, useState } from "react"
import './Order.css'
import AuthStore from "../AuthStore"
import Header from "../components/Navbar"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import api from "../Axios/Script"

function Order() {
  const { token } = AuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchOrders = async () => {
    try {
      let res = await api.get("/order", {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })

      let data = res.data
      // Sort orders by date (newest first)
      if (Array.isArray(data)) {
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders()
    }else{
      navigate('/login')
    }
  }, [token])

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'on the way': return 'status-shipping';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  return (
    <>
      <Header />
      <div className="orders-page-wrapper">
        <div className="orders-container">
          <div className="orders-header">
            <h1>Your Orders</h1>
            <p>Track and manage your recent purchases</p>
          </div>

          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Fetching your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card-premium">
                  <div className="order-card-header">
                    <div className="order-meta-top">
                      <div className="meta-item">
                        <span className="meta-label">Order placed</span>
                        <span className="meta-value">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Total Amount</span>
                        <span className="meta-value highlight">₹{order.TotalPrice}</span>
                      </div>
                      <div className="meta-item status-badge-box">
                        <span className={`status-pill ${getStatusClass(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="order-id-track">
                      <span className="order-number">Order #ID: {order._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="ordered-products">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="product-item-mini">
                          <div className="product-mini-img">
                            <img src={item.pid?.image} alt={item.pid?.name} />
                          </div>
                          <div className="product-mini-info">
                            <h4>{item.pid?.name}</h4>
                            <p>Qty: {item.qty} × ₹{item.pid?.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="shipping-address-summary">
                      <h5>Shipping to:</h5>
                      <p><strong>{order.name}</strong></p>
                      <p>{order.address}, {order.district}</p>
                      <p>Pincode: {order.pincode}</p>
                      <p>Phone: {order.number}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-orders">
              <div className="empty-icon">📂</div>
              <h3>No orders yet!</h3>
              <p>When you buy items, they will appear here for you to track.</p>
              <Link to="/" className="shop-now-btn">Start Shopping</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Order