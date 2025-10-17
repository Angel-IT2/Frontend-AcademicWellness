import { useEffect } from "react";
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

  // Determine WhatsTheDifference link based on role - FIXED to use profile.student_type
  const getWTDLink = () => {
    if (!storedUser) return "/login";
    
    const studentType = storedUser?.profile?.student_type;
    
    // Use the new single route that automatically routes based on role
    return "/dashboard/whats-the-difference";
  };

  const journeySteps = [
    { step: "1. Activate Account", link: null },
    { step: "2. Complete Profile", link: null },
    { step: "3. WhatsTheDifference", link: getWTDLink() },
    { step: "4. Setup Your Two-Week Plan", link: "/dashboard/two-week-planner" },
    { step: "5. Setup a Monthly Plan", link: "/dashboard/monthly-planner" },
  ];

  // Get user role for display
  const userRole = storedUser?.profile?.student_type || 'Student';
  const userName = storedUser?.profile?.full_name || storedUser?.first_name || 'Student';

  return (
    <div className="dashboard">
      <h2>User Journey</h2>
      <div className="journey-container">
        {journeySteps.map((item, index) => (
          <div
            key={index}
            className={`journey-card ${item.link ? "clickable" : ""}`}
            onClick={() => item.link && navigate(item.link)}
          >
            {item.step}
            {item.link && <span className="arrow">→</span>}
          </div>
        ))}
      </div>

      <h2>Quick Access</h2>
      <div className="quick-access-grid">
        <div className="planner-box" onClick={() => navigate("/dashboard/two-week-planner")}>
          <h3>📅 Two-Week Planner</h3>
          <p>Plan your next two weeks with detailed task scheduling.</p>
          <button>Open Planner</button>
        </div>
        
        <div className="planner-box" onClick={() => navigate("/dashboard/monthly-planner")}>
          <h3>📊 Monthly Planner</h3>
          <p>Plan your month with automated reminders for academic tasks.</p>
          <button>Open Planner</button>
        </div>
        
        <div className="planner-box" onClick={() => navigate(getWTDLink())}>
          <h3>💬 Academic Discussions</h3>
          <p>
            {userRole === "moderator" 
              ? "Moderate student posts and discussions" 
              : "Share insights and learn from fellow students"}
          </p>
          <button>
            {userRole === "moderator" ? "Moderate Posts" : "Join Discussion"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;