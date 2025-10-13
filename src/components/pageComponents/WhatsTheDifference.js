import React, { useEffect, useState } from "react";
import "./WhatstheDifference_style.css";

const WhatsTheDifference = () => {
  // ✅ Demo fallback posts (always available)
  const demoPosts = [
    {
      id: "demo-1",
      title: "Assessments are heavier",
      author_username: "Sarah J",
      content:
        "Tests, Assignments and Exams carry more weight each. Don't expect to do the same things you did in high school.",
      helpful_count: 5,
      created_at: "2025-08-30T12:00:00",
      replies: [],
      status: "approved",
    },
    {
      id: "demo-2",
      title: "Lectures move faster",
      author_username: "Michael K",
      content:
        "In university, lecturers won’t always slow down for everyone. It’s important to review slides before and after class.",
      helpful_count: 3,
      created_at: "2025-09-05T12:00:00",
      replies: [],
      status: "approved",
    },
    {
      id: "demo-3",
      title: "You must manage your own time",
      author_username: "Lerato M",
      content:
        "Nobody will remind you to do your work. Time management becomes a crucial skill if you want to keep up.",
      helpful_count: 7,
      created_at: "2025-09-08T12:00:00",
      replies: [],
      status: "approved",
    },
  ];

  // ✅ States
  const [posts, setPosts] = useState(demoPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [sortBy, setSortBy] = useState("helpful");
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ User info
  const userType = localStorage.getItem("student_type");
  const token = localStorage.getItem("access");

  // ✅ Format readable date
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

  // ✅ Fetch backend posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) {
        setError("No valid token found. Showing demo content.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "https://backend-academicwellness.onrender.com/api/wtd/posts/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          const merged = [...data, ...demoPosts];
          setPosts(merged);
        } else {
          setPosts(demoPosts);
          setError("Could not load posts from backend.");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Failed to load backend posts.");
        setPosts(demoPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  // ✅ Handle input change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Add new post (Seniors only)
  const addPost = async () => {
    if (userType !== "Senior") {
      alert("Only senior students can create posts.");
      return;
    }

    if (!formData.title || !formData.content) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const res = await fetch(
        "https://backend-academicwellness.onrender.com/api/wtd/posts/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Post submitted for approval!");
        setFormData({ title: "", content: "" });
        setShowForm(false);
      } else {
        alert(data.detail || "Failed to submit post.");
      }
    } catch (err) {
      console.error("Network error while submitting post:", err);
      alert("Network error while submitting post.");
    }
  };

  // ✅ Mark helpful (First-year only)
  const increaseHelpful = async (postId, isDemo) => {
    if (userType !== "First-year") {
      alert("Only first-year students can mark posts as helpful.");
      return;
    }

    if (isDemo) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, helpful_count: p.helpful_count + 1 } : p
        )
      );
      return;
    }

    try {
      const res = await fetch(
        `https://backend-academicwellness.onrender.com/api/wtd/posts/${postId}/helpful/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, helpful_count: data.helpful_count } : p
          )
        );
      } else {
        alert(data.detail || "Could not mark post as helpful.");
      }
    } catch (err) {
      console.error("Network error while marking helpful:", err);
      alert("Network error while marking helpful.");
    }
  };

  // ✅ Reply locally (no backend yet)
  const submitReply = (idx) => {
    if (!replyText.trim()) {
      alert("Please write something before submitting.");
      return;
    }
    const newPosts = [...posts];
    if (!newPosts[idx].replies) newPosts[idx].replies = [];
    newPosts[idx].replies.push({
      text: replyText,
      author: localStorage.getItem("user_email") || "You",
    });
    setPosts(newPosts);
    setReplying(null);
    setReplyText("");
  };

  // ✅ Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "helpful") return b.helpful_count - a.helpful_count;
    if (sortBy === "newest")
      return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="container">
      <h4>What’s The Difference</h4>
      <div className="wdifference-caption">
        Real insights from your seniors: High School vs University
      </div>

      {/* Senior post form toggle */}
      {userType === "Senior" && (
        <button id="toggleFormBtn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "− Hide Form" : "+ New Post"}
        </button>
      )}

      {showForm && (
        <div className="new-post">
          <h2>Submit a New Insight (Senior Students)</h2>
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
          />
          <button onClick={addPost}>Submit Post</button>
        </div>
      )}

      {/* Sort control */}
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

      {/* Posts list */}
      <div id="postsList">
        {sortedPosts.map((post, idx) => (
          <article className="post" key={post.id || idx}>
            <div className="post-header">
              <span>{post.title}</span>
              <span className="muted">{formatDate(post.created_at)}</span>
            </div>

            <div className="post-body">
              <div className="user">
                <div className="avatar">
                  {post.author_username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <strong>{post.author_username}</strong>{" "}
                  <span className="tag">Senior Student</span>
                </div>
              </div>

              <div className="body-text">{post.content}</div>

              <div className="actions">
                <button
                  onClick={() =>
                    increaseHelpful(post.id, post.id.toString().startsWith("demo"))
                  }
                >
                  👍 Helpful ({post.helpful_count})
                </button>
                <button>Report</button>
                <button
                  className="reply-btn"
                  onClick={() => setReplying(replying === idx ? null : idx)}
                >
                  Reply
                </button>
              </div>

              {replying === idx && (
                <div className="quick-reply">
                  <textarea
                    placeholder="Reply to this post..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="submit-row">
                    <button onClick={() => submitReply(idx)}>Submit reply</button>
                  </div>
                </div>
              )}

              {post.replies && post.replies.length > 0 && (
                <div className="replies">
                  {post.replies.map((r, i) => (
                    <div className="reply" key={i}>
                      <strong>{r.author}:</strong> {r.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default WhatsTheDifference;
