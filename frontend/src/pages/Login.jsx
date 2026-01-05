import { useState } from "react"
import './Login.css'
import Navbar from "../components/Navbar"
import { useNavigate, Link } from "react-router-dom"
import AuthStore from "../AuthStore"
import api from "../Axios/Script"

function Login() {
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { addToken } = AuthStore()

    const onClick = async () => {
        setError("") // Clear previous errors
        try {
            let res = await api.post("/login", {
                email: name,
                password: password
            });

            let data = await res.data;

            if (data.token) {
                addToken(data.token)
                alert("logined successfully")
                navigate("/")
            } else {
                setError(data.error || "Login failed. Please check your credentials.")
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("Something went wrong. Please try again later.")
        }
    }

    return (
        <>
            <Navbar />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Please enter your details to sign in</p>
                    </div>

                    {error && (
                        <div className="alert-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <input
                                className="login-input"
                                type="text"
                                placeholder="Enter your email"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                className="login-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button className="submit-btn" onClick={onClick}>SIGN IN</button>

                    <div className="register-link">
                        Don't have an account?
                        <Link to="/register">Register now</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login