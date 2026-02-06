import axios from "axios";

const api = axios.create({
    // baseURL: "http://localhost:8000",
    baseURL: "http://107.23.144.232:8000",
    withCredentials: true, // if using cookies/auth
});

export default api;
