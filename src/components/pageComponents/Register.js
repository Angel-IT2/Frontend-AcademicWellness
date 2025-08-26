import React, { useState } from "react";
import { FaGoogle, FaMicrosoft, FaApple, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./Auth.css";
import bgImage from "./academics.jpg";

function Register() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    alert("Registration successful!");
    // Add your registration logic here
  };

  return (
    <div className="form-box" style={{ backgroundImage: `url(${bgImage})` }}>
      <Navbar />

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Your UniPath Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          placeholder="Email"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="auth-btn">Register</button>

        <p className="auth-or">Or continue with</p>

        <div className="auth-social">
          <button className="social-btn google"><FaGoogle /> Google</button>
          <button className="social-btn microsoft"><FaMicrosoft /> Microsoft</button>
          <button className="social-btn apple"><FaApple /> Apple</button>
          <button className="social-btn phone"><FaPhone /> Phone</button>
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
