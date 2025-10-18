import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, HashRouter as Router, Routes } from "react-router-dom";
import "./App.css";

import About from "./components/pageComponents/About";
import AcademicChatboxes from "./components/pageComponents/AcademicChatboxes";
import Dashboard from "./components/pageComponents/Dashboard";
import DashboardLayout from "./components/pageComponents/DashboardLayout";
import FAQ from "./components/pageComponents/FAQ";
import Home from "./components/pageComponents/Home";
import Login from "./components/pageComponents/Login";
import MonthlyPlanner from "./components/pageComponents/MonthlyPlanner";
import Profile from "./components/pageComponents/Profile";
import Register from "./components/pageComponents/Register";
import TwoWeekPlanner from "./components/pageComponents/TwoWeekPlanner";
import Footer from "./components/sectionComponents/footer";
import Header from "./components/sectionComponents/header";

// Lazy loaded components
const WhatsTheDifference = lazy(() => import("./components/pageComponents/WhatsTheDifference"));
const ModeratorDifference = lazy(() => import("./components/pageComponents/ModeratorDifference"));
const FirstYearDifference = lazy(() => import("./components/pageComponents/FirstYearDifference"));
const SeniorDifference = lazy(() => import("./components/pageComponents/SeniorDifference"));

const WTDRouterContent = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;

  const studentType = user?.profile?.student_type?.toLowerCase();

  switch(studentType) {
    case "moderator":
      return <ModeratorDifference />;
    case "senior":
      return <SeniorDifference />;
    case "first-year":
    case "first_year":
      return <FirstYearDifference />;
    default:
      return <FirstYearDifference />;
  }
};

const WTDRouter = () => (
  <Suspense fallback={<div style={{ padding: "20px" }}>Loading WTD...</div>}>
    <WTDRouterContent />
  </Suspense>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;

  const studentType = user?.profile?.student_type?.toLowerCase();

  if (allowedRoles && !allowedRoles.includes(studentType)) {
    return <Navigate to="/dashboard" />;
  }

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
                  <ProtectedRoute>
                    <WTDRouter />
                  </ProtectedRoute>
                } />
                
                <Route path="moderator-difference" element={
                  <ProtectedRoute allowedRoles={["moderator"]}>
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
