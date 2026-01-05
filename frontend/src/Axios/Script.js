import axios from "axios";

const api = axios.create({
    // baseURL: "http://localhost:8000",
    baseURL: "https://project-ecommerce-ocfn.onrender.com",
    withCredentials: true, // if using cookies/auth
});

export default api;
