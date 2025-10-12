import React, { useState, useEffect } from "react";
import "./WhatstheDifference_style.css";

const WhatsTheDifference = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  const API_URL = "https://backend-academicwellness.onrender.com/api/wtd/posts";

  // helper to format date
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  // ✅ Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch posts.");
        const data = await res.json();
        setPosts(data.reverse()); // show newest first
      } catch (err) {
        console.error(err);
        setError("Could not load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ✅ Handle form input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Add new post (send to backend)
  const addPost = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      if (!res.ok) throw new Error("Failed to add post.");

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setFormData({ title: "", content: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting the post.");
    }
  };

  // ✅ Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  // ✅ UI render
  return (
    <div className="container">
      <h4>WhatsTheDifference</h4>
      <div className="wdifference-caption">
        Real Insights from your seniors: High school vs University
      </div>

      {/* Toggle form */}
      <button id="toggleFormBtn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "− Hide Form" : "+ New Post"}
      </button>

      {showForm && (
        <div className="new-post">
          <h2>Submit a new insight (Senior Students)</h2>
          <input
            type="text"
            required
            name="title"
            placeholder="Post title"
            value={formData.title}
            onChange={handleChange}
          />
          <textarea
            name="content"
            placeholder="Share your insight..."
            value={formData.content}
            onChange={handleChange}
          />
          <button onClick={addPost}>Submit Post</button>
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
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Loading/Error States */}
      {loading && <p>Loading posts...</p>}
      {error && <p className="error">{error}</p>}

      {/* Posts List */}
      <div id="postsList">
        {!loading && !error && sortedPosts.length === 0 && (
          <p>No posts yet. Be the first to share your insight!</p>
        )}

        {sortedPosts.map((post, idx) => (
          <article className="post" key={idx}>
            <div className="post-header">
              <span>{post.title}</span>
              <span className="muted">{formatDate(post.createdAt)}</span>
            </div>
            <div className="post-body">
              <div className="user">
                <div className="avatar">
                  {post.author
                    ? post.author.charAt(0).toUpperCase()
                    : post.title.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <strong>{post.author || "Anonymous"}</strong>{" "}
                  <span className="tag">Senior Student</span>
                </div>
              </div>

              <div className="body-text">{post.content}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WhatsTheDifference;
