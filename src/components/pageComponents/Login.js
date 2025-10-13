import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Auth.css";
import bgImage from "./academics.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://backend-academicwellness.onrender.com/api/auth/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password }),
        }
      );
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while logging in. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => alert("Google login not implemented yet.");

  return (
    <div className="form-box" style={{ backgroundImage: `url(${bgImage})` }}>
      <Navbar />
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login to UniPath</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="error-msg">{error}</div>}
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="auth-or">Or continue with</p>
        <div className="auth-social">
          <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
            <FaGoogle /> Google
          </button>
        </div>
        <p className="auth-footer">
          Don’t have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
