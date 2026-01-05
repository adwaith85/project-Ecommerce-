import { useState, useEffect } from "react"
import './Categories.css'
import Navbar from "../components/Navbar"
import AuthStore from "../AuthStore"
import CartStore from "../store"
import { Navigate } from "react-router-dom"
import api from "../Axios/Script"

function Categories() {
    const [categoryList, setCategoryList] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const { token } = AuthStore();
    const { add } = CartStore();

    // Fetch Categories
    const getCategories = async () => {
        try {
            const res = await api.get("/category", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = res.data;
            setCategoryList(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // Fetch Products (optionally filtered by category)
    const getProducts = async (catId) => {
        setLoading(true);
        try {
            let url = "/products";
            if (catId) url += `?category=${catId}`;

            const res = await api.get(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = res.data;
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
        getProducts(selectedCategory);
    }, [selectedCategory]);

    if (!token) return <Navigate to="/login" />;

    return (
        <>
            <Navbar />
            <div className="categories-page-container">
                <div className="categories-layout">
                    {/* Left Sidebar: Categories */}
                    <aside className="categories-sidebar">
                        <h2 className="sidebar-title">Explore</h2>
                        <div className="category-options-list">
                            <button
                                className={`cat-option-item ${!selectedCategory ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <span className="cat-dot"></span> All Products
                            </button>
                            {categoryList.map(cat => (
                                <button
                                    key={cat._id}
                                    className={`cat-option-item ${selectedCategory === cat._id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat._id)}
                                >
                                    {cat.image && <img src={cat.image} alt="" className="cat-mini-icon" />}
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Right Main: Product Grid */}
                    <main className="category-products-main">
                        <header className="category-main-header">
                            <h1>
                                {selectedCategory
                                    ? categoryList.find(c => c._id === selectedCategory)?.name
                                    : "All Collections"}
                            </h1>
                            <span className="product-count">{products.length} Products Found</span>
                        </header>

                        {loading ? (
                            <div className="loader-container">
                                <div className="loader"></div>
                                <p>Refining Selection...</p>
                            </div>
                        ) : (
                            <div className="category-products-grid">
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <div key={product._id} className="cat-product-card">
                                            <div className="product-img-box">
                                                <img src={product.image} alt={product.name} />
                                            </div>
                                            <div className="product-info">
                                                <span className="product-cat-tag">{product.category?.name}</span>
                                                <h3>{product.name}</h3>
                                                <div className="product-card-footer">
                                                    <span className="price">₹{product.price}</span>
                                                    <button onClick={() => add({
                                                        id: product._id,
                                                        name: product.name,
                                                        price: product.price,
                                                        image: product.image
                                                    })} className="add-to-bag-btn">
                                                        Add to Bag
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-products">
                                        <h3>No products in this category yet.</h3>
                                        <p>Try switching to another category or check back later!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

export default Categories;
