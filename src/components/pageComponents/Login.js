import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Navbar from "./Navbar";
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
      
      // DEBUG LOGS
      console.log("🔍 LOGIN DEBUG:");
      console.log("Login response status:", response.status);
      console.log("Full login response:", data);
      console.log("User object:", data.user);
      console.log("Profile object:", data.user?.profile);
      console.log("Student type in profile:", data.user?.profile?.student_type);
      console.log("Has student_type?", !!data.user?.profile?.student_type);
      
      setLoading(false);

      if (response.ok) {
        console.log("✅ Login successful!");
        
        // Store both access and refresh tokens
        localStorage.setItem("token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Check what we stored
        console.log("🔍 STORED USER DATA:");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("Stored user:", storedUser);
        console.log("Stored profile:", storedUser?.profile);
        console.log("Stored student_type:", storedUser?.profile?.student_type);
        
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        setError(data.message || data.detail || "Invalid email or password.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
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
          Don't have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;