import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li onClick={() => navigate("/dashboard")}>Home</li>
        <li onClick={() => navigate("/two-week-planner")}>Two-Week Planner</li>
        <li onClick={() => navigate("/monthly-planner")}>Monthly Planner</li>
        <li onClick={() => navigate("/academic-chatboxes")}>Academic Chatboxes</li>
        <li
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
