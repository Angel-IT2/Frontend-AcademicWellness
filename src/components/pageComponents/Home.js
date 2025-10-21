import "./Home.css";
import Navbar from "./Navbar";
import GoogleAnalytics from "./GoogleAnalytics";
import { Helmet } from "react-helmet";

function Home() {
  return (
    <div className="home-card">
      <Helmet>
        <title>UniPath – Academic & Social Wellness for First-Year Students</title>
        <meta
          name="description"
          content="UniPath is a peer-powered platform that supports first-year university students in academic and social wellness. Connect with peers, share resources, and grow together."
        />
        <meta
          name="keywords"
          content="university, first-year students, peer mentorship, academic wellness, student wellbeing, chatrooms, study help, UniPath"
        />
        <meta name="author" content="UniPath Team – Powered by JugamSoft Technologies" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "UniPath",
            "url": "https://frontend-academicwellness.onrender.com",
            "logo": "https://frontend-academicwellness.onrender.com/logo.png",
            "sameAs": [
              "https://www.facebook.com/unipath",
              "https://www.twitter.com/unipath",
              "https://www.linkedin.com/company/unipath"
            ],
            "description": "A peer-powered academic and social wellness platform for first-year university students. UniPath connects students to resources, mentorship, and community support to improve academic success and wellbeing.",
            "founder": {
              "@type": "Organization",
              "name": "JugamSoft Technologies"
            }
          }
          `}
        </script>
      </Helmet>

      <GoogleAnalytics />
      <Navbar />

      <div className="home-content">
        <h1 className="welcome-text">Welcome to UniPath</h1>
        <p className="subtitle">Your pathway to academic and social success</p>
      </div>
    </div>
  );
}

export default Home;