import React from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardLayout;
