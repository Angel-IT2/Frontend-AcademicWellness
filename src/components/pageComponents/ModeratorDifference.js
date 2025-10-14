import React, { useState, useEffect } from "react";
import "./WhatstheDifference_style.css";
import { API_URL, getAuthHeaders } from "../apiComponents/api";

const ModeratorDifference = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.student_type === "Moderator") {
      setUser(storedUser);
      fetchPosts("pending");
    }
  }, []);

  const fetchPosts = async (status = "pending") => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wtd/posts/?status=${status}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await fetch(`${API_URL}/api/wtd/posts/${id}/${action}/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      fetchPosts(filter);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  if (!user) return <p>Only moderators can access this page.</p>;

  return (
    <div className="container">
      <h4>Moderator – WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Manage insights submitted by Senior Students
      </div>

      <p>Logged in as <strong>{user.full_name}</strong> (Moderator)</p>

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
        {posts.length === 0 && !loading && <p>No {filter} posts available.</p>}
        {posts.map((p) => (
          <article className="post" key={p.id}>
            <div className="post-header">
              <span>{p.title}</span>
              <span className="muted">{formatDate(p.created_at)}</span>
            </div>
            <div className="post-body">
              <div className="user-info">
                <strong>{p.author_username}</strong>
                <span className="tag">{p.status}</span>
              </div>
              <div className="body-text">{p.content}</div>
              {filter === "pending" && (
                <div className="actions">
                  <button onClick={() => handleAction(p.id, "approve")}>✅ Approve</button>
                  <button onClick={() => handleAction(p.id, "reject")}>❌ Reject</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ModeratorDifference;
