import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/home";

import Admin from "./pages/admin";
import Register from "./pages/register";
import Login from "./pages/Login";
import Cart from "./pages/cart";
import Categories from "./pages/Categories";
import DisplayCategory from "./components/cate-items";
import Checkout from "./components/checkout";
import Order from "./pages/Order";
import Profile from "./pages/Profile";
import Payment from "./pages/payment";

function CustomRoute() {


    return <>

        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/Categories" element={<Categories />} />
                <Route path="/Categories/:name" element={<DisplayCategory />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/Order" element={<Order />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>


        </BrowserRouter>
    </>
}

export default CustomRoute


