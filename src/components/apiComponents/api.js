// src/components/apiComponents/api.js
export const API_URL = "https://backend-academicwellness.onrender.com";

// Get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return { "Content-Type": "application/json" };
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Generic helper for API requests
export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const options = {
    method,
    headers: getAuthHeaders(),
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
};

// 🟢 Approve a post (Moderator only)
export const approvePost = async (id) => {
  return apiRequest(`/api/wtd/posts/${id}/approve/`, "POST");
};

// 🔴 Reject a post (Moderator only)
export const rejectPost = async (id) => {
  return apiRequest(`/api/wtd/posts/${id}/reject/`, "POST");
};
