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
import TwoWeekPlanner from "./components/pageComponents/TwoWeekPlanner";
import MonthlyPlanner from "./components/pageComponents/MonthlyPlanner";
import AcademicChatboxes from "./components/pageComponents/AcademicChatboxes";
import DashboardLayout from "./components/pageComponents/DashboardLayout";

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
            <Route path="/dashboard" element={<DashboardLayout />} />
            <Route path="/two-week-planner" element={<TwoWeekPlanner />} />
            <Route path="/monthly-planner" element={<MonthlyPlanner />} />
            <Route path="/academic-chatboxes" element={<AcademicChatboxes />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
