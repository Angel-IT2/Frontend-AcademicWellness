export const API_URL = "https://backend-academicwellness.onrender.com"; // backend base URL

// Function to get headers with Bearer token for authenticated requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { "Content-Type": "application/json" };
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

