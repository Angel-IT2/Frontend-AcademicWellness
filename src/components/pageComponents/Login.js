import React, { useState } from "react";
import { FaGoogle} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Auth.css";
import bgImage from "./academics.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      setError("No user found. Please register first.");
      return;
    }

    if (storedUser.email === email && storedUser.password === password) {
      setError("");
      alert("Login successful!");
      localStorage.setItem("loggedInUser", email); // ✅ Save logged-in user
      navigate("/dashboard"); // Redirect to Dashboard
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="form-box" style={{ backgroundImage: `url(${bgImage})` }}>
      <Navbar />
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login to UniPath</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error-msg">{error}</div>}

        <button className="auth-btn">Login</button>

        <p className="auth-or">Or continue with</p>
        <div className="auth-social">
          <button type="button" className="social-btn google"><FaGoogle /> Google</button>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
