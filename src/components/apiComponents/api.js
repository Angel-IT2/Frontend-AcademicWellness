// src/components/apiComponents/api.js

export const API_URL = "https://backend-academicwellness.onrender.com";

/**
 * Get current auth headers with Bearer token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};

/**
 * Refresh access token using the stored refresh token
 */
const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      console.warn("Failed to refresh access token.");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("token", data.access);
      return data.access;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }

  return null;
};

/**
 * Universal API Request Handler with Token Auto-Retry
 * @param {string} endpoint - API endpoint (e.g., /api/wtd/posts/)
 * @param {string} method - HTTP method (default: GET)
 * @param {Object} body - Request body (optional)
 * @returns JSON response
 */
export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const headers = getAuthHeaders();

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  let response = await fetch(`${API_URL}${endpoint}`, options);

  // If token expired → try refresh
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      };
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  // Handle errors gracefully
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return response.json();
};
