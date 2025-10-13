import React, { useEffect, useState } from "react";
import "./WhatstheDifference_style.css";

const API_BASE = "https://backend-academicwellness.onrender.com/api";

const ModeratorDifference = () => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  // Helper: Save token
  const saveTokens = (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  };

  // =============================
  // 🔐 LOGIN (Moderator)
  // =============================
  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      alert("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data.access, data.refresh);
        setAccessToken(data.access);
        setLoggedIn(true);
        alert("Moderator logged in successfully!");
        fetchPosts("pending", data.access);
      } else {
        alert("Login failed: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 📦 FETCH POSTS BY STATUS
  // =============================
  const fetchPosts = async (status = "pending", token = accessToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // ✅ APPROVE / ❌ REJECT
  // =============================
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/${id}/${action}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Post ${action}ed successfully.`);
        fetchPosts(filter);
      } else {
        alert("Action failed: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Moderator action error:", err);
    }
  };

  // =============================
  // 🧩 DATE FORMATTER
  // =============================
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  // =============================
  // UI RENDER
  // =============================
  return (
    <div className="container">
      <h4>Moderator – WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Manage Insights submitted by Senior Students
      </div>

      {!loggedIn ? (
        <div className="new-post" style={{ backgroundColor: "#0b5ed7" }}>
          <h2>Moderator Login</h2>
          <input
            type="text"
            name="username"
            placeholder="Username (e.g. Mia)"
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
          />
          <input
            type="password"
            name="password"
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

          <div id="postsList">
            {posts.length === 0 && !loading && (
              <p>No {filter} posts available.</p>
            )}

            {posts.map((post) => (
              <article className="post" key={post.id}>
                <div className="post-header">
                  <span>{post.title}</span>
                  <span className="muted">{formatDate(post.created_at)}</span>
                </div>

                <div className="post-body">
                  <div className="user">
                    <div className="avatar">
                      {post.author_username
                        ? post.author_username.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="user-info">
                      <strong>{post.author_username}</strong>{" "}
                      <span className="tag">
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="body-text">{post.content}</div>

                  <div className="actions">
                    <span>👍 Helpful: {post.helpful_count}</span>

                    {filter === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(post.id, "approve")}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleAction(post.id, "reject")}
                        >
                          ❌ Reject
                        </button>
                      </>
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

export default ModeratorDifference;
