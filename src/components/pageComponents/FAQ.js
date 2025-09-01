import React, { useState } from "react";
import faqs from "./faqs"; 
import "./Faq-style.css";

function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header Section */}
      <div className="headerf">
        <h1 className="headerf-title">FAQs</h1>
        <p className="headerf-desc">Frequently Asked Questions</p>
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
    </div>
  );
}

export default FAQ;
