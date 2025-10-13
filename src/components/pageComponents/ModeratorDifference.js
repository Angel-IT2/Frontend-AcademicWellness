import React, { useState, useEffect } from "react";
import "./WhatstheDifference_style.css";

const API_BASE = "https://backend-academicwellness.onrender.com/api";

const ModeratorDifference = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  // Load moderator info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.student_type === "Moderator") {
        setUser(parsedUser);
        fetchPosts("pending", token);
      }
    }
  }, []);

  // Auto refresh token every 9 minutes
  useEffect(() => {
    const interval = setInterval(refreshToken, 9 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return;
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem("token", data.access);
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
  };

  // Fetch posts by status
  const fetchPosts = async (status = "pending", token) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject posts
  const handleAction = async (id, action) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/${id}/${action}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Post ${action}ed successfully.`);
        fetchPosts(filter, token);
      } else {
        alert("Action failed.");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="container">
      <h4>Moderator – WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Manage insights submitted by Senior Students
      </div>

      {!user ? (
        <p>Only moderators can access this page.</p>
      ) : (
        <>
          <p>
            Logged in as <strong>{user.full_name}</strong> (Moderator)
          </p>

          <div className="sort-controls">
            <label htmlFor="filterSelect">Filter by: </label>
            <select
              id="filterSelect"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                fetchPosts(e.target.value, localStorage.getItem("token"));
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
            {posts.map((p) => (
              <article className="post" key={p.id}>
                <div className="post-header">
                  <span>{p.title}</span>
                  <span className="muted">{formatDate(p.created_at)}</span>
                </div>
                <div className="post-body">
                  <div className="user">
                    <div className="avatar">
                      {p.author_username
                        ? p.author_username.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="user-info">
                      <strong>{p.author_username}</strong>
                      <span className="tag">{p.status}</span>
                    </div>
                  </div>
                  <div className="body-text">{p.content}</div>
                  <div className="actions">
                    <span>👍 Helpful: {p.helpful_count}</span>
                    {filter === "pending" && (
                      <>
                        <button onClick={() => handleAction(p.id, "approve")}>
                          ✅ Approve
                        </button>
                        <button onClick={() => handleAction(p.id, "reject")}>
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
