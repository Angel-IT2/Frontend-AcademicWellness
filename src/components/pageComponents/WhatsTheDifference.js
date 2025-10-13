import React, { useEffect, useState } from "react";
import "./WhatstheDifference_style.css";

const API_BASE = "https://backend-academicwellness.onrender.com/api";

const WhatsTheDifference = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("helpful");

  // Load user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setRole(parsedUser.student_type);
      fetchPosts(parsedUser.student_type, token);
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

  // Fetch posts (approved for First-year/Senior)
  const fetchPosts = async (role, token) => {
    try {
      let url = `${API_BASE}/wtd/posts/`;
      if (role === "Senior" || role === "First-year") url += "?status=approved";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  // Handle form changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit new post (Senior only)
  const handleSubmit = async () => {
    if (!formData.title || !formData.content)
      return alert("Please fill in all fields.");
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Post submitted successfully (pending approval).");
        setFormData({ title: "", content: "" });
        fetchPosts(role, token);
      } else {
        alert("Error submitting post.");
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark Helpful (First-year only)
  const markHelpful = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/wtd/posts/${id}/helpful/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.already_marked) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, helpful_count: data.helpful_count } : p
          )
        );
      } else {
        alert("You already marked this post as helpful.");
      }
    } catch (err) {
      console.error("Helpful error:", err);
    }
  };

  // Format date
  const formatDate = (iso) => new Date(iso).toLocaleString();

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "helpful") return b.helpful_count - a.helpful_count;
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  return (
    <div className="container">
      <h4>WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Real Insights from your seniors: High school vs University
      </div>

      {!user ? (
        <p>Please log in to see posts.</p>
      ) : (
        <>
          <p>
            Logged in as <strong>{user.full_name}</strong> ({role})
          </p>

          {/* Senior-only form */}
          {role === "Senior" && (
            <div className="new-post">
              <h2>Share Your Insight</h2>
              <input
                type="text"
                name="title"
                placeholder="Post title"
                value={formData.title}
                onChange={handleChange}
              />
              <textarea
                name="content"
                placeholder="Share your tip..."
                value={formData.content}
                onChange={handleChange}
              />
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Post"}
              </button>
            </div>
          )}

          {/* Sorting */}
          <div className="sort-controls">
            <label htmlFor="sortSelect">Sort by: </label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="helpful">Most Helpful</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Posts */}
          <div id="postsList">
            {sortedPosts.length === 0 && <p>No posts available.</p>}
            {sortedPosts.map((p) => (
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
                      <strong>{p.author_username}</strong>{" "}
                      <span className="tag">{p.status}</span>
                    </div>
                  </div>
                  <div className="body-text">{p.content}</div>
                  {role === "First-year" && p.status === "approved" && (
                    <div className="actions">
                      <button onClick={() => markHelpful(p.id)}>
                        👍 Helpful ({p.helpful_count})
                      </button>
                    </div>
                  )}
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
