import { useState, useRef, useEffect } from "react"
import './Admin.css'
import AuthStore from "../AuthStore"
import { Link, Navigate } from "react-router-dom"
import React from 'react';
import api from "../Axios/Script";

function Admin() {
  const { token } = AuthStore()
  const [activeTab, setActiveTab] = useState('orders') // 'orders', 'categories', 'products', 'users'
  const [loading, setLoading] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Global Data
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Form Inputs
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [price, setPrice] = useState("")
  const [catId, setCatId] = useState("")

  // Editing State
  const [editingId, setEditingId] = useState(null)

  // API Callers
  const fetchAllOrders = async () => {
    try {
      const res = await api.get("/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = res.data
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = res.data
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  const fetchProducts = async (filteredCatId = null) => {
    try {
      let url = "/products"
      if (filteredCatId) url += `?category=${filteredCatId}`
      const res = await api.get(url, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = res.data
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = res.data
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (token) {
      if (activeTab === 'orders') fetchAllOrders()
      if (activeTab === 'categories') fetchCategories()
      if (activeTab === 'products') {
        fetchProducts(selectedCategory)
        fetchCategories()
      }
      if (activeTab === 'users') {
        fetchUsers()
        const interval = setInterval(fetchUsers, 10000) // Auto-refresh every 10s
        return () => clearInterval(interval)
      }
    }
  }, [activeTab, selectedCategory, token])

  // Submissions
  const handleProductSubmit = async () => {
    if (!name || !price || !catId) return alert("Fill all product fields")
    setLoading(true)
    try {
      const url = editingId ? `/products/${editingId}` : "/products"
      const data = { name, price, image, category: catId }
      const headers = { "Authorization": `Bearer ${token}` }

      const res = editingId
        ? await api.put(url, data, { headers })
        : await api.post(url, data, { headers })

      if (res.status === 201 || res.status === 200) {
        alert(editingId ? "Product Updated!" : "Product Created!")
        resetForm()
        fetchProducts(selectedCategory)
      }
    } catch (e) {
      console.error(e)
      alert("Error: " + (e.response?.data?.message || e.message))
    }
    finally { setLoading(false) }
  }

  const handleCategorySubmit = async () => {
    if (!name) return alert("Category name required")
    setLoading(true)
    try {
      const url = editingId ? `/category/${editingId}` : "/category"
      const data = { name, image }
      const headers = { "Authorization": `Bearer ${token}` }

      const res = editingId
        ? await api.put(url, data, { headers })
        : await api.post(url, data, { headers })

      if (res.status === 201 || res.status === 200) {
        alert(editingId ? "Category Updated!" : "Category Created!")
        resetForm()
        fetchCategories()
      }
    } catch (e) {
      console.error(e)
      alert("Error: " + (e.response?.data?.message || e.message))
    }
    finally { setLoading(false) }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return
    try {
      await api.delete(`/category/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      fetchCategories()
    } catch (e) { console.error(e) }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return
    try {
      await api.delete(`/products/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      fetchProducts(selectedCategory)
    } catch (e) { console.error(e) }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      fetchUsers()
    } catch (e) { console.error(e) }
  }

  const startEditCategory = (cat) => {
    setEditingId(cat._id)
    setName(cat.name)
    setImage(cat.image)
  }

  const startEditProduct = (prod) => {
    setEditingId(prod._id)
    setName(prod.name)
    setImage(prod.image)
    setPrice(prod.price)
    setCatId(prod.category?._id || prod.category)
  }

  const resetForm = () => {
    setName(""); setImage(""); setPrice(""); setCatId("")
    setEditingId(null)
  }

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id)
  }

  if (!token) return <Navigate to="/login" />

  return (
    <div className="admin-layout-wrapper">
      <header className="admin-header">
        <div className="admin-nav-top">
          <Link to="/" className="back-link">← Home</Link>
          <div className="admin-tabs">
            <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
            <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => { setActiveTab('categories'); resetForm(); }}>Categories</button>
            <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); resetForm(); }}>Products</button>
            <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          </div>
          <div className="admin-user-marker">ADMIN </div>
        </div>
      </header>

      <main className="admin-content-body">

        {activeTab === 'orders' && (
          <section className="dashboard-section">
            <h1 className="section-title">All Orders</h1>
            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>ID / Name</th>
                    <th>Email</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>More</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <React.Fragment key={order._id}>
                      <tr className={expandedOrderId === order._id ? 'expanded-parent' : ''}>
                        <td data-label="ID / Name">
                          <div className="id-block">
                            <small>#{order._id.slice(-6).toUpperCase()}</small>
                            <strong>{order.name}</strong>
                          </div>
                        </td>
                        <td data-label="Email" className="email-cell">{order.userId?.email || 'Guest'}</td>
                        <td data-label="Payment">
                          <span className={`mini-badge ${order.paymentStatus === 'Paid' ? 'paid-bg' : 'unpaid-bg'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span className={`status-dot status-${order.status?.toLowerCase().replace(/\s/g, '-')}`}></span>
                          <span className="status-label">{order.status}</span>
                        </td>
                        <td data-label="Total"><strong>₹{order.TotalPrice}</strong></td>
                        <td data-label="More">
                          <button
                            className={`icon-toggle ${expandedOrderId === order._id ? 'open' : ''}`}
                            onClick={() => toggleExpand(order._id)}
                            title="Toggle Details"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === order._id && (
                        <tr className="details-dropdown-row">
                          <td colSpan="6">
                            <div className="compact-details-box">
                              <div className="details-mini-grid">
                                <div className="mini-card">
                                  <h6>Address</h6>
                                  <p>{order.address}, {order.district} - {order.pincode}</p>
                                  <p>{order.number}</p>
                                </div>
                                <div className="mini-card">
                                  <h6>Logistics</h6>
                                  <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                                  <p>Method: {order.paymentMethod}</p>
                                </div>
                                <div className="mini-card itemized">
                                  <h6>Items({order.orderItems?.length})</h6>
                                  <div className="mini-scroll">
                                    {order.orderItems?.map((item, idx) => (
                                      <div key={idx} className="small-product-row">
                                        <img src={item.pid?.image} alt="" />
                                        <span>{item.qty}x {item.pid?.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* CATEGORY SECTION */}
        {activeTab === 'categories' && (
          <section className="dashboard-section cat-section-compact">
            <h1 className="section-title">Category Creation</h1>

            <div className="cat-form-container">
              <div className="cat-form-header">
                <h3>{editingId ? 'Modify Category' : 'New Category'}</h3>
                {editingId && <button className="cancel-edit-btn" onClick={resetForm}>Cancel Edit</button>}
              </div>
              <div className="cat-standard-form">
                <div className="form-item">
                  <label>Category Name</label>
                  <input className="cat-input-box" placeholder="e.g. Premium Watches" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-item">
                  <label>Image URL</label>
                  <input className="cat-input-box" placeholder="https://source.unsplash.com/..." value={image} onChange={e => setImage(e.target.value)} />
                </div>
                <button className="cat-submit-btn" onClick={handleCategorySubmit} disabled={loading}>
                  {loading ? 'Working...' : editingId ? 'Update Record' : 'Create Category'}
                </button>
              </div>
            </div>

            <div className="cat-table-wrapper">
              <table className="cat-premium-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat._id}>
                      <td data-label="ID" className="cat-id-cell">#{cat._id.slice(-6).toUpperCase()}</td>
                      <td data-label="Image"><img src={cat.image} className="cat-list-img" alt="" /></td>
                      <td data-label="Name" className="cat-name-cell"><strong>{cat.name}</strong></td>
                      <td data-label="Time" className="cat-time-cell">{cat.createdAt ? new Date(cat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td data-label="Date" className="cat-date-cell">{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td data-label="Actions">
                        <div className="cat-action-group">
                          <button className="cat-edit-btn" onClick={() => startEditCategory(cat)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button className="cat-del-btn" onClick={() => handleDeleteCategory(cat._id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PRODUCT SECTION */}
        {activeTab === 'products' && (
          <section className="dashboard-section prod-section-compact">
            <h1 className="section-title">Product Creation</h1>

            <div className="prod-form-container">
              <div className="prod-form-header">
                <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                {editingId && <button className="cancel-edit-btn" onClick={resetForm}>Cancel</button>}
              </div>
              <div className="prod-standard-form">
                <div className="form-item">
                  <label>Product Name</label>
                  <input className="prod-input-box" placeholder="e.g. Galaxy S24 Ultra" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-row-group">
                  <div className="form-item">
                    <label>Price (₹)</label>
                    <input type="number" className="prod-input-box" placeholder="00.00" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div className="form-item">
                    <label>Category</label>
                    <select className="prod-input-box" value={catId} onChange={e => setCatId(e.target.value)}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-item">
                  <label>Image Resource URL</label>
                  <input className="prod-input-box" placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} />
                </div>
                <button className="prod-submit-btn" onClick={handleProductSubmit} disabled={loading}>
                  {loading ? 'Processing...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>

            <div className="category-view">
              <div className="table-container product-table-wrapper">
                <table className="premium-table prod-mini-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Category</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Time</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td data-label="Ref ID" className="monospace-text">#{p._id.slice(-6).toUpperCase()}</td>
                        <td data-label="Category"><span className="cat-badge-mini">{p.category?.name}</span></td>
                        <td data-label="Image"><img src={p.image} className="prod-list-thumb" alt="" /></td>
                        <td data-label="Product Name" className="prod-name-cell"><strong>{p.name}</strong></td>
                        <td data-label="Market Price" className="price-cell">₹{p.price}</td>
                        <td data-label="Time" className="txt-muted small-text">{p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                        <td data-label="Date" className="txt-muted small-text">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td data-label="Actions">
                          <div className="action-flex-center">
                            <button className="mini-edit-icon" onClick={() => startEditProduct(p)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="mini-del-icon" onClick={() => handleDeleteProduct(p._id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* USERS SECTION */}
        {activeTab === 'users' && (
          <section className="dashboard-section user-section-compact">
            <h1 className="section-title">All Users</h1>
            <div className="table-container">
              <table className="premium-table user-mini-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Basic Info</th>
                    <th>Contact</th>
                    <th>Joined Date</th>
                    <th>Activity</th>
                    <th>Orders</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td data-label="User ID" className="monospace-text">#{u._id.slice(-6).toUpperCase()}</td>
                      <td data-label="Basic Info">
                        <div className="user-profile-stack">
                          <img src={u.profileImage || "https://vectorified.com/images/no-profile-picture-icon-2.jpg"} className="user-row-img" alt="" />
                          <div className="user-name-role">
                            <strong>{u.name}</strong>
                            <span className="role-micro-tag">{u.role}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Contact">
                        <div className="contact-stack">
                          <small>{u.email}</small>
                          <small>{u.number}</small>
                        </div>
                      </td>
                      <td data-label="Joined Date" className="txt-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td data-label="Activity">
                        <span className={`status-pill ${u.status === 'Login' ? 'active-pill' : 'inactive-pill'}`}>
                          {u.status || 'Offline'}
                        </span>
                      </td>
                      <td data-label="Orders">
                        <div className="order-count-badge">{u.orderCount || 0}</div>
                      </td>
                      <td data-label="Actions">
                        <div className="action-flex-center">
                          <button className="mini-del-icon" onClick={() => handleDeleteUser(u._id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Admin