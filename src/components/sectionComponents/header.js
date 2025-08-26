import React from "react";
import { Link } from "react-router-dom";
import "./header.css";

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">UniPath</h1>
      <nav>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/login" className="nav-link">Login</Link>
          </li>
          <li>
            <Link to="/register" className="nav-link">Register</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
