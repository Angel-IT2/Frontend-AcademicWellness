import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/sectionComponents/header";
import Footer from "./components/sectionComponents/footer";
import Home from "./components/pageComponents/Home";
import Login from "./components/pageComponents/Login";
import Register from "./components/pageComponents/Register";

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
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
