import { useState } from "react";
import './Register.css'
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import api from "../Axios/Script";

function Register() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/register", {
        name: data.name,
        email: data.email,
        number: data.number,
        password: data.password,
      });
      setSuccessMessage("Registration successful! Redirecting to login...");
      reset();
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error:", err.response.data);
      setServerError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Join us to start shopping today</p>
          </div>

          {serverError && (
            <div className="alert-message alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert-message alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <input
                  className="register-input"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              {errors.name && (
                <div className="error-message">
                  <span>⚠</span> {errors.name.message}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <input
                  className="register-input"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <div className="error-message">
                  <span>⚠</span> {errors.email.message}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <input
                  className="register-input"
                  type="number"
                  placeholder="Enter your phone number"
                  {...register("number", { required: "Number is required" })}
                />
              </div>
              {errors.number && (
                <div className="error-message">
                  <span>⚠</span> {errors.number.message}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  className="register-input"
                  type="password"
                  placeholder="Create a password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                />
              </div>
              {errors.password && (
                <div className="error-message">
                  <span>⚠</span> {errors.password.message}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "REGISTER"}
            </button>

            <div className="login-link">
              Already have an account?
              <Link to="/login">Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
