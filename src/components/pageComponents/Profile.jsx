import React, { useState, useEffect } from "react";
import "./Profile.css";

const Profile = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", course: "", year: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setFormData({ fullName: user.full_name || "", email: user.email || "", course: user.course || "", year: user.student_type || "" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = { ...JSON.parse(localStorage.getItem("user")), full_name: formData.fullName, email: formData.email, course: formData.course, student_type: formData.year };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        <label>Course of Study</label>
        <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="Enter your course" />
        <label>Student Type</label>
        <select name="year" value={formData.year} onChange={handleChange} required>
          <option value="">Select Student Type</option>
          <option value="First-year">First-year</option>
          <option value="Senior">Senior</option>
          <option value="Moderator">Moderator</option>
        </select>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default Profile;
