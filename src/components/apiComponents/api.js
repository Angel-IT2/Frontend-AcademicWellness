// src/components/apiComponents/api.js
export const API_URL = "https://backend-academicwellness.onrender.com"; // replace if needed

export const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.access) return {};
  return {
    Authorization: `Bearer ${user.access}`,
    "Content-Type": "application/json",
  };
};
