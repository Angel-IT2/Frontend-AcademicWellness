export const API_URL = "https://backend-academicwellness.onrender.com";

// Get authorization headers
export const getAuthHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token") || user?.access; // fallback to stored access token
    if (!token) return { "Content-Type": "application/json" };
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  } catch (err) {
    console.error("Error reading auth token:", err);
    return { "Content-Type": "application/json" };
  }
};
