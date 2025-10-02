import React from "react";
import aboutData from "./about.json";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      {/* Title and Subtitle */}
      <header className="about-header">
        <h1>{aboutData.title}</h1>
        <p>{aboutData.subtitle}</p>
      </header>

      {/* Wellbeing Sections with Images */}
      <section className="wellbeing-sections">
        {aboutData.sections.map((section, index) => (
          <div key={index} className="wellbeing-section">
            <div className="section-content">
              <div className="section-text">
                <h10>{section.heading}</h10>
                <ul>
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="section-image">
                <img src={section.image} alt={section.heading} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Benefits */}
      <section className="benefits-section">
        <h11>Benefits of UniPath</h11>
        {Object.entries(aboutData.benefits).map(([key, items], index) => (
          <div key={index} className="benefit-category">
            <h3>{key}</h3>
            <ul>
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};

export default About;
