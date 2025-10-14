export const API_URL = "https://backend-academicwellness.onrender.com/api";

// Get auth headers with Bearer token
export const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token") || user?.access;

  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
