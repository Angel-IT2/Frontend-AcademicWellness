import React, { useState } from "react";
import faqs from "./faqs";
import "./Faq-style.css";

function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here (e.g., send to API or email service)
    setFormData({ name: "", email: "", message: "" });
    setFeedback("submitted");
  };

  const handleYesClick= () =>{ setFeedback("thankyou")}

  return (
    <div>
      {/* Header Section */}
      <div className="headerf">
        <h1 className="headerf-title">FAQs</h1>
        <p className="headerf-desc">Got a question? Below are some of the mostly asked questions.</p>
        <div className="search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq">
        <div className="faq-name">
          <h1 className="faq-header"> </h1>
        </div>

        <div className="faq-box">
          {filteredFaqs.map(faq => (
            <div key={faq.id} className="faq-wrapper">
              <input
                type="checkbox"
                className="faq-trigger"
                id={`faq-${faq.id}`}
              />
              <label className="faq-title" htmlFor={`faq-${faq.id}`}>
                {faq.question}
              </label>
              <div className="faq-detail">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="feedback-popup">
        {feedback !== "submitted" && feedback !=="thankyou" && (
          <>
            <p>Did you find what you were looking for?</p>
            <div className="feedback-options">
              <button 
                onClick={handleYesClick}
              >
                Yes
              </button>
              <button 
                onClick={() => setFeedback("no")} 
                
              >
                No
              </button>
            </div>
          </>
        )}

         {feedback === "thankyou" && (<p className="thank-you-msg">Thank you for your feedback! </p>
         )}
        

        {feedback === "no" && (
          <form className="contact-form" onSubmit={handleFormSubmit}>
            <h3>Contact Us</h3>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              required
            />
            <button type="submit">Send Message</button>
          </form>
        )}

        {feedback === "submitted" && (
          <p className="thank-you-msg">Thank you for your feedback! We'll get back to you soon.</p>
        )}
      </div>
    </div>
  );
}

export default FAQ;