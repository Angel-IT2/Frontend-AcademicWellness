import React, { useState, useEffect } from "react";
import "./WhatstheDifference_style.css";

const API_BASE = "https://backend-academicwellness.onrender.com/api";

// Helper: Token management
const saveTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};
const getAccess = () => localStorage.getItem("access_token");
const getRefresh = () => localStorage.getItem("refresh_token");

const WhatsTheDifference = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [sortBy, setSortBy] = useState("helpful");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

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
        localStorage.setItem("access_token", data.access);
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
    if (!loginData.email || !loginData.password) return alert("Enter credentials.");
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data.access, data.refresh);
        setUser(loginData.email);
        fetchPosts();
        alert("Logged in successfully!");
      } else alert("Login failed.");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // ========== FETCH POSTS ==========
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/`, {
        headers: { Authorization: `Bearer ${getAccess()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };

  useEffect(() => {
    if (getAccess()) fetchPosts();
  }, []);

  // ========== CREATE POST ==========
  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return alert("Please fill all fields.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccess()}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Post submitted (pending approval).");
        setPosts([data, ...posts]);
        setFormData({ title: "", content: "" });
      } else alert("Error: " + JSON.stringify(data));
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== MARK HELPFUL ==========
  const markHelpful = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/${id}/helpful/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAccess()}` }
      });
      const data = await res.json();
      if (!data.already_marked) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, helpful_count: data.helpful_count } : p
          )
        );
      } else {
        alert("You already marked this post.");
      }
    } catch (err) {
      console.error("Helpful error:", err);
    }
  };

  // Sort
  const sortedPosts = [...posts].sort((a, b) =>
    sortBy === "helpful"
      ? b.helpful_count - a.helpful_count
      : new Date(b.created_at) - new Date(a.created_at)
  );

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="container">
      <h4>WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Real Insights from your seniors: High school vs University
      </div>

      {!user ? (
        <div className="new-post">
          <h2>Login to Access Insights</h2>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="firstyear">First-year</option>
            <option value="senior">Senior</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <p>
            Logged in as <strong>{user}</strong> ({role})
          </p>

          {role === "senior" && (
            <div className="new-post">
              <h2>Submit a new insight</h2>
              <input
                type="text"
                name="title"
                placeholder="Post title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <textarea
                name="content"
                placeholder="Share your insight..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Post"}
              </button>
            </div>
          )}

          <div className="sort-controls">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="helpful">Most Helpful</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div id="postsList">
            {sortedPosts.map((p) => (
              <article className="post" key={p.id}>
                <div className="post-header">
                  <span>{p.title}</span>
                  <span className="muted">{formatDate(p.created_at)}</span>
                </div>
                <div className="post-body">
                  <p>{p.content}</p>
                  <div className="actions">
                    {role === "firstyear" && p.status === "approved" && (
                      <button onClick={() => markHelpful(p.id)}>
                        👍 Helpful ({p.helpful_count})
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsTheDifference;
