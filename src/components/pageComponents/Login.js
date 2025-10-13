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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "https://backend-academicwellness.onrender.com/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Get the user's role from backend response
        const userRole = data.user.student_type; // or data.user.role if backend uses "role"

        // Redirect based on role
        if (userRole === "Moderator") {
          navigate("/moderator-difference");
        } else {
          navigate("/whats-the-difference");
        }
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while logging in. Please try again.");
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

        <button className="auth-btn" type="submit">
          Login
        </button>

        <p className="auth-or">Or continue with</p>

        <div className="auth-social">
          <button type="button" className="social-btn google">
            <FaGoogle /> Google
          </button>
        </div>

        <p className="auth-footer">
          Don’t have an account?{" "}
          <Link to="/register" className="link">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
