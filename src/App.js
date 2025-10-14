import React, { useState, useEffect, Suspense, lazy } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Header from "./components/sectionComponents/header";
import Footer from "./components/sectionComponents/footer";
import Home from "./components/pageComponents/Home";
import Login from "./components/pageComponents/Login";
import Register from "./components/pageComponents/Register";
import FAQ from "./components/pageComponents/FAQ";
import About from "./components/pageComponents/About";
import DashboardLayout from "./components/pageComponents/DashboardLayout";
import Dashboard from "./components/pageComponents/Dashboard";
import Profile from "./components/pageComponents/Profile";
import TwoWeekPlanner from "./components/pageComponents/TwoWeekPlanner";
import MonthlyPlanner from "./components/pageComponents/MonthlyPlanner";
import AcademicChatboxes from "./components/pageComponents/AcademicChatboxes";

const WhatsTheDifference = lazy(() => import("./components/pageComponents/WhatsTheDifference"));
const ModeratorDifference = lazy(() => import("./components/pageComponents/ModeratorDifference"));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.student_type)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="body">
          <Suspense fallback={<div style={{ padding: "20px" }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/faqs" element={<FAQ />} />
              <Route path="/about" element={<About />} />

              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="whats-the-difference" element={
                  <ProtectedRoute allowedRoles={["First-year", "Senior"]}>
                    <WhatsTheDifference />
                  </ProtectedRoute>
                } />
                <Route path="moderator-difference" element={
                  <ProtectedRoute allowedRoles={["Moderator"]}>
                    <ModeratorDifference />
                  </ProtectedRoute>
                } />
                <Route path="two-week-planner" element={<TwoWeekPlanner tasks={tasks} setTasks={setTasks} />} />
                <Route path="monthly-planner" element={<MonthlyPlanner tasks={tasks} setTasks={setTasks} />} />
                <Route path="academic-chatboxes" element={<AcademicChatboxes />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
