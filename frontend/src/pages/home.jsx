import React, { useEffect, useState, useRef } from "react";
import './Home.css'
import LandingPage from "./LandingPage";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Navbar";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Carousel from 'react-bootstrap/Carousel';

import AuthStore from "../AuthStore";
import CartStore from "../store";
import api from "../Axios/Script";

function Home() {
  const [data, SetData] = useState([]);
  const [searchItem, SetSearchItem] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();
  const { token } = AuthStore();

   const getData = async () => {
  if (!token) return;

  try {
    const params = {
      search: searchItem,
    };

    if (selectedCategory) {
      params.category = selectedCategory;
    }

    const res = await api.get("/products", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    SetData(res.data);
  } catch (error) {
    console.error("Failed to fetch products:", error);

    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        navigate("/login");
      }
    }
  }
};


  const { setCart: setStoreCart } = CartStore();

  const fetchUserCart = async () => {
    if (!token) return;
    try {
      const res = await api.get("/getUser", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        if (userData.cart && userData.cart.length > 0) {
          setStoreCart(userData.cart);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user cart:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getData();
      fetchUserCart();
    }
  }, [searchItem, token, selectedCategory]);

  return (
    <>
      <div className="home-page">
        <Header SetSearchItem={SetSearchItem} />
        {token ? (
          <>
            <HomeCarousel />


            <div className="home-welcome-section">
              <h1>Welcome to ShopCart</h1>
              <p>Discover the best deals on electronics, fashion, and more. Shop now and get exclusive offers!</p>
            </div>

            <CateOption token={token} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

            <Container fluid>
              <Row>
                <h3 className="text-center mb-4">Featured Products</h3>
                <HorizontalScroll>
                  {data.length > 0 ? (
                    data.map((item) => (
                      <Detail
                        key={item._id}
                        image={item.image}
                        name={item.name}
                        price={item.price}
                        id={item._id}
                        category={item?.category ?? ""}
                      />
                    ))
                  ) : (
                    <p className="text-center w-100">No products found.</p>
                  )}
                </HorizontalScroll>
              </Row>
            </Container>

            <section className="features-section">
              <h2>Why Choose Us</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <span className="feature-icon">🚀</span>
                  <h3>Fast Delivery</h3>
                  <p>Get your products delivered to your doorstep in record time.</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">🛡️</span>
                  <h3>Secure Payment</h3>
                  <p>Your transactions are safe and secured with top-notch encryption.</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">🎧</span>
                  <h3>24/7 Support</h3>
                  <p>Our customer support team is always here to help you.</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">💎</span>
                  <h3>Best Quality</h3>
                  <p>We guarantee the best quality products for our customers.</p>
                </div>
              </div>
            </section>

            <section className="newsletter-section">
              <div className="newsletter-content">
                <h2>Subscribe to our Newsletter</h2>
                <p>Stay updated with our latest products and exclusive offers.</p>
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="Enter your email" className="newsletter-input" />
                  <button type="submit" className="newsletter-btn">Subscribe</button>
                </form>
              </div>
            </section>

            {/* <Footer /> */}
          </>
        ) : (
          <LandingPage />
        )}
      </div>
    </>
  );
}

function HomeCarousel() {
  return (
    <div className="home-carousel-container">
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-item-img"
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="First slide"
          />
          <Carousel.Caption className="carousel-caption-custom">
            <h3>Big Sale!</h3>
            <p>Get up to 50% off on selected items.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-item-img"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Second slide"
          />
          <Carousel.Caption className="carousel-caption-custom">
            <h3>New Arrivals</h3>
            <p>Check out the latest fashion trends.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-item-img"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRTQN1IK9aX4wLedhAaCoblfXKooPAQVcOpA&s"
            alt="Third slide"
          />
          <Carousel.Caption className="carousel-caption-custom">
            <h3>Electronics</h3>
            <p>Upgrade your gadgets today.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-item-img"
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1999&q=80"
            alt="Fourth slide"
          />
          <Carousel.Caption className="carousel-caption-custom">
            <h3>Accessories</h3>
            <p>Complete your look with our accessories.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-item-img"
            src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Fifth slide"
          />
          <Carousel.Caption className="carousel-caption-custom">
            <h3>Limited Time Offer</h3>
            <p>Don't miss out on these deals.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

function Detail(props) {
  const { add } = CartStore();

  const item = {
    id: props.id,
    image: props.image,
    name: props.name,
    price: props.price,
    category: props.category,
  };

  return (
    <Card className={`card ${props.className || ""}`}>
      <ListGroup variant="flush">
        <ListGroup.Item>
          <img className="card-image" src={item.image} alt={item.name} />
        </ListGroup.Item>
        <ListGroup.Item className="product-name" title={item.name}>{item.name}</ListGroup.Item>
        <ListGroup.Item className="product-price">₹{item.price}</ListGroup.Item>
        <ListGroup.Item className="product-category">{item?.category?.name ?? "no category"}</ListGroup.Item>
        <button
          onClick={() => {
            console.log(item);
            add(item);
          }}
        >
          Add to Cart
        </button>
      </ListGroup>
    </Card>
  );
}

function CateOption({ token, selectedCategory, setSelectedCategory }) {
  const [categorylist, setCategorylist] = useState([]);

  const getCategory = async () => {
    try {
      let res = await api.get("/category", {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      // if (!res.ok) return;
      let data = await res.data;
      setCategorylist(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <section className="flipkart-category-strip">
      <div
        className={`category-tile ${!selectedCategory ? 'active' : ''}`}
        onClick={() => setSelectedCategory(null)}
      >
        <div className="category-icon-placeholder all-icon">🏠</div>
        <span className="category-label">All</span>
      </div>
      {categorylist.map((item, index) => (
        <div
          className={`category-tile ${selectedCategory === item._id ? 'active' : ''}`}
          key={index}
          onClick={() => setSelectedCategory(item._id)}
        >
          {item.image && <img src={item.image} alt={item.name} className="category-icon" />}
          <span className="category-label">{item.name}</span>
        </div>
      ))}
    </section>
  );
}

function HorizontalScroll({ children }) {
  const containerRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cards = container.querySelectorAll('.card');
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenterX - cardCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setCenterIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Spacer to allow first and last card to reach center
  return (
    <div ref={containerRef} className="horizontal-scroll-container">
      <div className="scroll-spacer" />
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          className: `${child.props.className || ""} card${index === centerIndex ? " in-view" : ""}`,
          key: index,
        })
      )}
      <div className="scroll-spacer" />
    </div>
  );
}

export { Detail, CateOption, HorizontalScroll };
export default Home;
