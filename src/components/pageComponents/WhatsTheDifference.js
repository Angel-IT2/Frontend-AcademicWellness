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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/wtd/posts/`;
      if (isSenior) url += "?mine=1";
      if (isModerator) url += "?status=pending";

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();

      if (isModerator) {
        setPendingPosts(data.filter((p) => p.status === "pending"));
        setPosts(data.filter((p) => p.status === "approved"));
      } else {
        setPosts(data.filter((p) => p.status === "approved"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addPost = async () => {
    if (!formData.title || !formData.content) return alert("Please fill all fields.");
    if (!isSenior) return alert("Only seniors can submit posts");

    try {
      const res = await fetch(`${API_URL}/api/wtd/posts/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const newPost = await res.json();

      setPendingPosts([newPost, ...pendingPosts]);
      setFormData({ title: "", content: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Error creating post.");
    }
  };

  const handleAction = async (id, action) => {
    try {
      await fetch(`${API_URL}/api/wtd/posts/${id}/${action}/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const markHelpful = async (id) => {
    if (!isFirstYear) return alert("Only First-year students can mark helpful");
    try {
      await fetch(`${API_URL}/api/wtd/posts/${id}/helpful/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="container">
      <h4>WhatsTheDifference</h4>
      <div className="wdifference-caption">Real Insights from your seniors: High school vs University</div>

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

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <>
          {isModerator && pendingPosts.length > 0 && (
            <div className="pending-section">
              <h3>Pending Approval</h3>
              {pendingPosts.map((p) => (
                <div key={p.id} className="pending-post">
                  <strong>{p.title}</strong> by {p.author_username}
                  <button onClick={() => handleAction(p.id, "approve")}>Approve</button>
                  <button onClick={() => handleAction(p.id, "reject")}>Reject</button>
                </div>
              ))}
            </div>
          )}

          <div id="postsList">
            {posts.map((p) => (
              <article className="post" key={p.id}>
                <div className="post-header">
                  <span>{p.title}</span>
                  <span className="muted">{formatDate(p.created_at)}</span>
                </div>
                <div className="post-body">
                  <strong>{p.author_username}</strong>
                  <p>{p.content}</p>
                  <div className="actions">
                    {isFirstYear && (
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
