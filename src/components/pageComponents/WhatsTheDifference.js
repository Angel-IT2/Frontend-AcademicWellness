import React, { useState, useEffect } from "react";
import { API_URL, getAuthHeaders } from "../apiComponents/api";
import "./WhatstheDifference_style.css";

const WhatsTheDifference = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isModerator = user?.student_type === "Moderator";
  const isSenior = user?.student_type === "Senior";
  const isFirstYear = user?.student_type === "First-year";

  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [helpfulPosts, setHelpfulPosts] = useState([]);
  const [replying, setReplying] = useState(null);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      let url = `${API_URL}/wtd/posts/`;

      if (isSenior) url += "?mine=1";
      if (isModerator) url += "?status=pending";

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();

      if (isModerator) {
        setPendingPosts(data.filter((p) => p.status === "pending"));
        setPosts(data.filter((p) => p.status === "approved"));
      } else {
        setPosts(data.filter((p) => p.status === "approved"));
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching posts.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle form changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Senior: Create Post
  const addPost = async () => {
    if (!formData.title || !formData.content) return alert("Please fill all fields.");
    if (!isSenior) return alert("Only seniors can submit posts.");

    try {
      const res = await fetch(`${API_URL}/wtd/posts/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.detail || "Error creating post");

      setPendingPosts([data, ...pendingPosts]);
      setFormData({ title: "", content: "" });
      setShowForm(false);
      alert("Post submitted successfully! Pending moderator approval.");
    } catch (err) {
      console.error(err);
      alert("Error creating post.");
    }
  };

  // Moderator: Approve Post
  const approvePost = async (id) => {
    try {
      const res = await fetch(`${API_URL}/wtd/posts/${id}/approve/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Approval failed");
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Error approving post.");
    }
  };

  // Moderator: Reject Post
  const rejectPost = async (id) => {
    try {
      const res = await fetch(`${API_URL}/wtd/posts/${id}/reject/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Rejection failed");
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Error rejecting post.");
    }
  };

  // First-year: Mark helpful
  const markHelpful = async (id) => {
    if (!isFirstYear) return alert("Only First-year students can mark helpful");
    if (helpfulPosts.includes(id)) return alert("You already marked this post as helpful");

    try {
      const res = await fetch(`${API_URL}/wtd/posts/${id}/helpful/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to mark helpful");

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, helpful_count: data.helpful_count } : p))
      );
      setHelpfulPosts((prev) => [...prev, id]);
    } catch (err) {
      console.error(err);
      alert("Error marking post as helpful.");
    }
  };

  return (
    <div className="container">
      <h4>WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Real Insights from your seniors: High school vs University
      </div>

      {/* Senior: New Post Form */}
      {isSenior && (
        <>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "− Hide Form" : "+ New Post"}
          </button>

          {showForm && (
            <div className="new-post">
              <input
                type="text"
                name="title"
                placeholder="Post title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="content"
                placeholder="Share your insight..."
                value={formData.content}
                onChange={handleChange}
                required
              />
              <button onClick={addPost}>Submit Post</button>
            </div>
          )}
        </>
      )}

      {/* Moderator: Pending Posts */}
      {isModerator && pendingPosts.length > 0 && (
        <div className="pending-section">
          <h3>Pending Approval</h3>
          {pendingPosts.map((p) => (
            <div key={p.id} className="pending-post">
              <strong>{p.title}</strong> by {p.author_username}
              <button onClick={() => approvePost(p.id)}>✅ Approve</button>
              <button onClick={() => rejectPost(p.id)}>❌ Reject</button>
            </div>
          ))}
        </div>
      )}

      {/* Approved Posts */}
      <div id="postsList">
        {posts.map((p) => (
          <article className="post" key={p.id}>
            <div className="post-header">
              <span>{p.title}</span>
              <span className="muted">{new Date(p.created_at).toDateString()}</span>
            </div>
            <div className="post-body">
              <strong>{p.author_username}</strong>
              <p>{p.content}</p>
              <div className="actions">
                {isFirstYear && (
                  <button
                    disabled={helpfulPosts.includes(p.id)}
                    onClick={() => markHelpful(p.id)}
                  >
                    👍 Helpful ({p.helpful_count})
                  </button>
                )}
                <button onClick={() => setReplying(replying === p.id ? null : p.id)}>
                  Reply
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WhatsTheDifference;
