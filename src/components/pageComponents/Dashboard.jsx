import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
    }
  }, [storedUser, navigate]);

  const journeySteps = [
    { step: "1. Activate Account", link: null },
    { step: "2. Complete Profile", link: "/dashboard/profile" },
    { step: "3. Know The Difference", link: "/dashboard/whats-the-difference" },
    { step: "4. Setup Your Weekly Plan", link: "/dashboard/two-week-planner" },
    { step: "5. Setup a Monthly Plan", link: "/dashboard/monthly-planner" },
  ];

  return (
    <div className="dashboard">
      <h1>Student Journey</h1>
      <div className="journey-container">
        {journeySteps.map((item, index) => (
          <div
            key={index}
            className={`journey-card ${item.link ? "clickable" : ""}`}
            onClick={() => item.link && navigate(item.link)}
          >
            {item.step}
          </div>
        ))}
      </div>

      <h2>Monthly Academic Planner</h2>
      <div className="planner-box">
        <p>Plan your month with automated reminders for upcoming academic tasks.</p>
        <button onClick={() => navigate("/monthly-planner")}>
          Open Planner
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
