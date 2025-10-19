import React from "react";
import aboutData from "./about.json";
import "./About.css";
import { Helmet } from "react-helmet"; // For SEO

const About = () => {
  return (
    <div className="about-container">
      <Helmet>
        <title>About UniPath – Academic Wellness Platform</title>
        <meta
          name="description"
          content="Learn how UniPath empowers first-year university students to achieve academic wellness, confidence, and balance through peer mentorship and shared learning."
        />
        <meta
          name="keywords"
          content="academic wellness, peer mentorship, study skills, university support, student success, UniPath"
        />
        <meta name="author" content="UniPath Team – Powered by JugamSoft Technologies" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <div className="about-contents">
        {/* ===== Header Section ===== */}
        <header className="about-header">
          <h1>{aboutData.title}</h1>
          <p>{aboutData.subtitle}</p>
        </header>

        {/* ===== Academic Wellness Sections ===== */}
        <section className="wellbeing-sections">
          {aboutData.sections.map((section, index) => (
            <div key={index} className="wellbeing-section">
              <div className="section-content">
                <div className="section-text">
                  <h2>{section.heading}</h2>
                  <ul>
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ===== Benefits Section ===== */}
        <section className="benefits-section">
          <h2>Benefits of Academic Wellness</h2>
          <p>
            UniPath focuses on creating a supportive academic environment where first-year
            students can develop confidence, time management, and strong study habits
            through collaboration and mentorship.
          </p>

          {Object.entries(aboutData.benefits).map(([category, items], index) => (
            <div key={index} className="benefit-category">
              <h3>{category}</h3>
              <ul>
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ===== Closing Philosophy Section ===== */}
        <footer className="about-footer">
          <h2>Our Philosophy</h2>
          <p>
            “It’s about learning, not about being the smartest.”  
            UniPath believes in fostering an inclusive academic culture where students
            uplift one another, share knowledge, and grow together.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default About;