import React from "react";
import { Link, useLocation} from "react-router-dom";
import "./header.css";

const Header = () => {
  const location = useLocation();
  const hideButtonsOn = ["/dashboard"];
  const hideButtons = hideButtonsOn.includes(location.pathname);
  return (
    <header className="header">
      <h1 className="logo">UniPath</h1>
      <nav>
        <ul className="nav-links">
          {!hideButtons && (
            <>
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/login" className="nav-link">Login</Link>
          </li>
          <li>
            <Link to="/register" className="nav-link">Register</Link>
          </li>
          </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
