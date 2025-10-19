import "./Home.css";
import Navbar from "./Navbar";
import GoogleAnalytics from "./GoogleAnalytics"; // import GA component

function Home() {
  return (
    <div className="home-card">
      <GoogleAnalytics /> {/* Tracks pageviews automatically */}
      <Navbar />
      <div className="home-content">
        <h1 className="welcome-text">Welcome to UniPath</h1>
        <p className="subtitle">Your pathway to success</p>
      </div>
    </div>
  );
}

export default Home;
