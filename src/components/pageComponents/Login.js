import React from "react";
import { FaGoogle, FaMicrosoft, FaApple, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./Auth.css";
import bgImage from "./academics.jpg";

function Login() {
  return (
    <div className="form-box" style={{ backgroundImage: `url(${bgImage})` }}>
      <Navbar />

      <form className="auth-form">
        <h2>Login to UniPath</h2>

        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />

        <button className="auth-btn">Login</button>

        <p className="auth-or">Or continue with</p>

        <div className="auth-social">
          <button className="social-btn google"><FaGoogle /> Google</button>
          <button className="social-btn microsoft"><FaMicrosoft /> Microsoft</button>
          <button className="social-btn apple"><FaApple /> Apple</button>
          <button className="social-btn phone"><FaPhone /> Phone</button>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
