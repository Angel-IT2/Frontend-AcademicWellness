import React, { useState, useEffect } from "react";
import "./WhatstheDifference_style.css";

const API_BASE = "https://backend-academicwellness.onrender.com/api";

const saveTokens = (access, refresh) => {
  localStorage.setItem("mod_access_token", access);
  localStorage.setItem("mod_refresh_token", refresh);
};
const getAccess = () => localStorage.getItem("mod_access_token");
const getRefresh = () => localStorage.getItem("mod_refresh_token");

const ModeratorDifference = () => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  // ========== AUTO TOKEN REFRESH ==========
  const refreshAccessToken = async () => {
    const refresh = getRefresh();
    if (!refresh) return;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh })
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem("mod_access_token", data.access);
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
  };

  // Refresh every 9 minutes
  useEffect(() => {
    const interval = setInterval(refreshAccessToken, 9 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ========== LOGIN ==========
  const handleLogin = async () => {
    if (!loginData.username || !loginData.password)
      return alert("Enter credentials.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data.access, data.refresh);
        setLoggedIn(true);
        alert("Moderator logged in successfully!");
        fetchPosts("pending");
      } else alert("Login failed.");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== FETCH POSTS ==========
  const fetchPosts = async (status = "pending") => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/?status=${status}`, {
        headers: { Authorization: `Bearer ${getAccess()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== APPROVE/REJECT ==========
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/${id}/${action}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAccess()}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Post ${action}ed successfully.`);
        fetchPosts(filter);
      } else alert("Action failed.");
    } catch (err) {
      console.error("Moderator action error:", err);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="container">
      <h4>Moderator – WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Manage Insights from Senior Students
      </div>

      {!loggedIn ? (
        <div className="new-post" style={{ backgroundColor: "#0b5ed7" }}>
          <h2>Moderator Login</h2>
          <input
            type="text"
            placeholder="Username (e.g. Mia)"
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      ) : (
        <>
          <div className="sort-controls">
            <label htmlFor="filterSelect">Filter by: </label>
            <select
              id="filterSelect"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                fetchPosts(e.target.value);
              }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading && <p>Loading posts...</p>}

          {posts.map((post) => (
            <article className="post" key={post.id}>
              <div className="post-header">
                <span>{post.title}</span>
                <span className="muted">{formatDate(post.created_at)}</span>
              </div>
              <div className="post-body">
                <p>{post.content}</p>
                <p>
                  <strong>By:</strong> {post.author_username} |{" "}
                  <strong>Status:</strong> {post.status}
                </p>
                <div className="actions">
                  <span>👍 Helpful: {post.helpful_count}</span>
                  {filter === "pending" && (
                    <>
                      <button onClick={() => handleAction(post.id, "approve")}>
                        ✅ Approve
                      </button>
                      <button onClick={() => handleAction(post.id, "reject")}>
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  );
};

export default ModeratorDifference;
