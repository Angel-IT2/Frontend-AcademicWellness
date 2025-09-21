import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaCalendarCheck,
  FaComments,
  FaSignOutAlt,
  FaGraduationCap,
} from "react-icons/fa";
import "./DashboardLayout.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Home", path: "/dashboard", icon: <FaHome /> },
    { label: "WhatsTheDifference", path: "/dashboard/whats-the-difference", icon: <FaGraduationCap /> },
    { label: "Two-Week Planner", path: "/dashboard/two-week-planner", icon: <FaCalendarCheck /> },
    { label: "Monthly Planner", path: "/dashboard/monthly-planner", icon: <FaCalendarAlt /> },
    { label: "Academic Chatboxes", path: "/dashboard/academic-chatboxes", icon: <FaComments /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">UniPath Dashboard</h2>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </li>
        ))}
        <li className="sidebar-item logout" onClick={handleLogout}>
          <span className="icon">
            <FaSignOutAlt />
          </span>
          <span className="label">Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
