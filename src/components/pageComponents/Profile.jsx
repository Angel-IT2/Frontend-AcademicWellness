import React, { useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    course: "",
    year: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile saved:", formData);
  };

  return (
    <div className="profile-container">
      <h2>Complete Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label>Course of Study</label>
        <input
          type="text"
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
        />
        <label>Year of Study</label>
        <select
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="first">First Year</option>
          <option value="senior">Senior</option>
        </select>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default Profile;
