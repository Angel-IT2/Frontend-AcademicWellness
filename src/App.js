import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/sectionComponents/header";
import Footer from "./components/sectionComponents/footer";

// Pages
import Home from "./components/pageComponents/Home";
import Login from "./components/pageComponents/Login";
import Register from "./components/pageComponents/Register";
import FAQ from "./components/pageComponents/FAQ";
import About from "./components/pageComponents/About";
import DashboardLayout from "./components/pageComponents/DashboardLayout";
import Dashboard from "./components/pageComponents/Dashboard";
import Profile from "./components/pageComponents/Profile";
import WhatsTheDifference from "./components/pageComponents/WhatsTheDifference";
import ModeratorDifference from "./components/pageComponents/ModeratorDifference"; // ✅ NEW IMPORT
import TwoWeekPlanner from "./components/pageComponents/TwoWeekPlanner";
import MonthlyPlanner from "./components/pageComponents/MonthlyPlanner";
import AcademicChatboxes from "./components/pageComponents/AcademicChatboxes";

function App() {
  // Shared tasks state with localStorage persistence
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="body">
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/about" element={<About />} />

            {/* Dashboard and internal pages */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />

              {/* ✅ Student/Senior “What’s The Difference” */}
              <Route
                path="whats-the-difference"
                element={<WhatsTheDifference />}
              />

              {/* ✅ Moderator “What’s The Difference” */}
              <Route
                path="moderator-difference"
                element={<ModeratorDifference />}
              />

              {/* ✅ Planners */}
              <Route
                path="two-week-planner"
                element={<TwoWeekPlanner tasks={tasks} setTasks={setTasks} />}
              />
              <Route
                path="monthly-planner"
                element={<MonthlyPlanner tasks={tasks} setTasks={setTasks} />}
              />

              {/* ✅ Academic chat */}
              <Route path="academic-chatboxes" element={<AcademicChatboxes />} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
