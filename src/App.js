import React from "react";
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
import DashboardLayout from "./components/pageComponents/DashboardLayout";
import Dashboard from "./components/pageComponents/Dashboard";
import Profile from "./components/pageComponents/Profile";
import WhatsTheDifference from "./components/pageComponents/WhatsTheDifference";
import TwoWeekPlanner from "./components/pageComponents/TwoWeekPlanner";
import MonthlyPlanner from "./components/pageComponents/MonthlyPlanner";
import AcademicChatboxes from "./components/pageComponents/AcademicChatboxes";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="body">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/faqs" element={<FAQ />} />

            {/* Dashboard Layout with nested routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="whats-the-difference" element={<WhatsTheDifference />} />
              <Route path="two-week-planner" element={<TwoWeekPlanner />} />
              <Route path="monthly-planner" element={<MonthlyPlanner />} />
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
