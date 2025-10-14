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
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    navigate("/login"); // Redirect if not logged in
    return null;
  }

  const studentType = (user?.student_type || "").trim();

  const wtdPath =
    studentType === "Moderator"
      ? "/dashboard/moderator-difference"
      : "/dashboard/whats-the-difference";

  const menuItems = [
    { label: "Home", path: "/dashboard", icon: <FaHome /> },
    { label: "WhatsTheDifference", path: wtdPath, icon: <FaGraduationCap /> },
    { label: "Two-Week Planner", path: "/dashboard/two-week-planner", icon: <FaCalendarCheck /> },
    { label: "Monthly Planner", path: "/dashboard/monthly-planner", icon: <FaCalendarAlt /> },
    { label: "Academic Chatboxes", path: "/dashboard/academic-chatboxes", icon: <FaComments /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header"><h1 className="sidebar-logo">UniPath</h1></div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <div className="icon">{item.icon}</div>
              <div className="label">{item.label}</div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-logout-container">
        <li className="sidebar-link logout" onClick={handleLogout}>
          <div className="icon"><FaSignOutAlt /></div>
          <div className="label">Logout</div>
        </li>
      </div>
    </aside>
  );
};

export default Sidebar;
