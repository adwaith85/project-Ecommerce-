import { Link } from "react-router-dom"
import './Navbar.css'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import NavLink from "./NavLink";
import api from "../Axios/Script";
import AuthStore from "../AuthStore";
import CartStore from "../store";

function Header({ SetSearchItem }) {
  const { removeToken, token } = AuthStore()
  const { clear, cart } = CartStore()
  const location = useLocation()

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const syncCart = async () => {
      if (token && cart.length >= 0) {
        try {
          await api.post("/saveCart", { cart }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Cart sync failed:", error);
        }
      }
    };

    // Debounce syncing to avoid too many requests
    const timeout = setTimeout(syncCart, 1000);
    return () => clearTimeout(timeout);
  }, [cart, token]);

  const handleLogout = async () => {
    try {
      await api.post("/logout", { cart }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    removeToken();
    clear();
  };

  return (
    <Navbar expand="lg" className="navbar" fixed="top">
      <Container>
        <div className="d-flex align-items-center gap-3">
          <Navbar.Toggle aria-controls="navbarScroll" className="navbar-toggle" />
          <Navbar.Brand as={Link} to="/" className="navbar-brand me-0">
            Shop<span>Cart</span>
          </Navbar.Brand>
        </div>

        <Navbar.Collapse id="navbarScroll" className="navbar-collapse">
          <Nav className="me-auto my-2 my-lg-0 navcontent" navbarScroll>
            <Nav.Link as={Link} to="/" className="nav-link">Home</Nav.Link>
            <Nav.Link as={Link} to="/Categories" className="nav-link">Categories</Nav.Link>
            {token && (
              <>
                <Nav.Link as={Link} to="/cart" className="nav-link cart-link">
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Nav.Link>
                <Nav.Link as={Link} to="/order" className="nav-link">Orders</Nav.Link>
                <Nav.Link as={Link} to="/profile" className="nav-link">Profile</Nav.Link>
                <Nav.Link as={Link} to="/admin" className="nav-link">Admin</Nav.Link>
              </>
            )}
          </Nav>

          <NavLink showOn={["/"]}>
            <Form className="d-flex navsearch">
              <Form.Control
                onChange={(e) => SetSearchItem(e.target.value)}
                type="search"
                placeholder="Search for products..."
                aria-label="Search"
              />
            </Form>
          </NavLink>

          <div className="auth-link">
            {!token ? (
              <Link to="/Login" className="nav-link">Login</Link>
            ) : (
              <button className="nav-link ad" onClick={handleLogout}>Logout</button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header