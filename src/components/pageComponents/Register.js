import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Navbar from "./Navbar";
import bgImage from "./academics.jpg";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentType, setStudentType] = useState("First-year");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    setLoading(true);

    // DEBUG LOGS
    console.log("🔍 REGISTRATION DEBUG:");
    console.log("Selected student_type:", studentType);
    console.log("Sending to backend:", {
      full_name: fullName,
      email: email,
      password: password,
      confirm_password: confirmPassword,
      student_type: studentType,
    });

    try {
      const response = await fetch(
        "https://backend-academicwellness.onrender.com/api/auth/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
            confirm_password: confirmPassword,
            student_type: studentType,
          }),
        }
      );

      const data = await response.json();
      
      // DEBUG LOGS
      console.log("🔍 REGISTRATION RESPONSE:");
      console.log("Response status:", response.status);
      console.log("Response data:", data);
      console.log("User data returned:", data.user);
      console.log("Profile in response:", data.user?.profile);
      console.log("Student type in response:", data.user?.profile?.student_type);
      
      setLoading(false);

      if (response.ok) {
        console.log("✅ Registration successful!");
        alert("Registration successful! You can now log in.");
        navigate("/login");
      } else {
        console.log("❌ Registration failed");
        setError(data.message || data.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      console.log("❌ Network error:", err);
      setError("Network error. Please check your connection.");
    }
  };

  return (
    <div className="form-box" style={{ backgroundImage: `url(${bgImage})` }}>
      <Navbar />
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Your UniPath Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <select
          value={studentType}
          onChange={(e) => setStudentType(e.target.value)}
          required
          className="auth-select"
        >
          <option value="First-year">First-year</option>
          <option value="Senior">Senior</option>
          <option value="Moderator">Moderator</option>
        </select>

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="auth-or">Or continue with</p>
        <div className="auth-social">
          <button type="button" className="social-btn google">
            <FaGoogle /> Google
          </button>
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;