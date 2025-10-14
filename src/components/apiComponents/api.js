export const API_URL = "https://backend-academicwellness.onrender.com";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
