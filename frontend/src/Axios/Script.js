import axios from "axios";

const api = axios.create({
    // baseURL: "http://34.224.26.244:8000",
    baseURL: "http://localhost:8000",
    withCredentials: true,
});

export default api;
