// api.js - Enhanced version with debugging
export const API_URL = "https://backend-academicwellness.onrender.com";

/**
 * Get current auth headers with Bearer token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("🔐 Current token:", token ? "Present" : "Missing");
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
  console.log("🔄 Refresh token:", refresh ? "Present" : "Missing");
  
  if (!refresh) {
    console.warn("No refresh token available");
    return null;
  }

  try {
    console.log("🔄 Attempting token refresh...");
    const res = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    console.log("🔄 Token refresh response status:", res.status);

    if (!res.ok) {
      console.warn("❌ Failed to refresh access token.");
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return null;
    }

    const data = await res.json();
    if (data.access) {
      console.log("✅ Token refresh successful");
      localStorage.setItem("token", data.access);
      return data.access;
    }
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
  }

  return null;
};

/**
 * Universal API Request Handler with Token Auto-Retry
 */
export const apiRequest = async (endpoint, method = "GET", body = null, queryParams = null) => {
  // Build URL with query parameters
  let url = `${API_URL}${endpoint}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams).toString();
    url += `?${params}`;
  }

  console.log(`🌐 API Call: ${method} ${url}`);
  if (body) console.log("📦 Request body:", body);
  if (queryParams) console.log("🔍 Query params:", queryParams);

  const token = localStorage.getItem("token");
  const headers = getAuthHeaders();

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  let response;
  try {
    response = await fetch(url, options);
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
  } catch (networkError) {
    console.error("❌ Network error:", networkError);
    throw new Error("Network error: Unable to reach the server");
  }

  // If token expired → try refresh
  if (response.status === 401) {
    console.log("🔐 Token expired, attempting refresh...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log("🔄 Retrying request with new token...");
      const retryHeaders = {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      };
      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
      console.log(`🔄 Retry response: ${response.status}`);
    }
  }

  // Handle errors gracefully
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.error("❌ API Error response:", errorData);
    } catch (parseError) {
      const errorText = await response.text();
      console.error("❌ API Error (non-JSON):", errorText);
      errorData = { message: errorText || `HTTP ${response.status}` };
    }
    
    throw new Error(errorData.detail || errorData.message || errorData.error || `API request failed with status ${response.status}`);
  }

  try {
    const data = await response.json();
    console.log("✅ API Success response:", data);
    return data;
  } catch (parseError) {
    console.error("❌ Failed to parse JSON response:", parseError);
    throw new Error("Invalid JSON response from server");
  }
};