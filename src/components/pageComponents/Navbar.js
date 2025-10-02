import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // reuse navbar styles

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <div className="nav-title">
        <h2>UniPath</h2>
      </div>

      <div className="nav-menu">
        <ul>
          <li><button className="link" onClick={() => navigate("/")}>Home</button></li>
          <li><button className="link" onClick={() => navigate("/About")}>About</button></li>
          <li><button className="link" onClick={() => navigate("/faqs")}>FAQs</button></li>
        </ul>
      </div>

      <div className="button-group">
        <button className="btn login-btn" onClick={() => navigate("/login")}>Login</button>
        <button className="btn register-btn" onClick={() => navigate("/register")}>Register</button>
      </div>
    </nav>
  );
}

export default Navbar;
