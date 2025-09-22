import React from "react";
import Navbar from "./Navbar";
import "./Home.css";


function Home() {
  return (
    <div className="home-card">
      <Navbar />
      <div className="home-content">
        <h8 className="welcome-text">Welcome to UniPath</h8>
        <p className="subtitle">Your pathway to success</p>
      </div>
    </div>
  );
}

export default Home;
