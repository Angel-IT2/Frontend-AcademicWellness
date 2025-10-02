import React, { useState } from "react";
import "./WhatstheDifference_style.css"; 

const WhatsTheDifference = () => {
  // helper to format dates
  const formatDate = (d) => {
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  // state for posts
  const [posts, setPosts] = useState([
    {
      title: "Assessments are heavier",
      author: "Sarah J",
      content:
        "Tests, Assignments and Exams carry more weight each. Don't expect to do the same things you did in high school.",
      helpful: 5,
      timestamp: new Date("2025-08-30T12:00:00"),
      replies: []
    },
    {
      title: "Lectures move faster",
      author: "Michael K",
      content:
        "In university, lecturers won’t always slow down for everyone. It’s important to review slides before and after class.",
      helpful: 3,
      timestamp: new Date("2025-09-05T12:00:00"),
      replies: []
    },
    {
      title: "You must manage your own time",
      author: "Lerato M",
      content:
        "Nobody will remind you to do your work. Time management becomes a crucial skill if you want to keep up.",
      helpful: 7,
      timestamp: new Date("2025-09-08T12:00:00"),
      replies: []
    },
  ]);

  // pending posts
  const [pendingPosts, setPendingPosts] = useState([]);

  // form + UI
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", author: "", content: "" });

  // sorting
  const [sortBy, setSortBy] = useState("helpful");

  // reply
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ get logged in user
  const loggedInUser = localStorage.getItem("loggedInUser");

  // ✅ track helpful clicks per user
  const [helpfulClicked, setHelpfulClicked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("helpfulClicked")) || {};
    return saved;
  });

  // helper: check if user already clicked
  const hasUserClicked = (postId) => {
    if (!loggedInUser) return false;
    return helpfulClicked[loggedInUser]?.includes(postId);
  };

  // handle form input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // add new post (goes to pending)
  const addPost = () => {
    if (!formData.title || !formData.author || !formData.content) {
      alert("Please fill out all fields.");
      return;
    }
    const newPost = {
      title: formData.title,
      author: formData.author,
      content: formData.content,
      helpful: 0,
      timestamp: new Date(),
      replies: []
    };
    setPendingPosts([newPost, ...pendingPosts]);
    setFormData({ title: "", author: "", content: "" });
    setShowForm(false);
  };

  // approve pending post
  const approvePost = (idx) => {
    const approved = pendingPosts[idx];
    setPosts([approved, ...posts]);
    setPendingPosts(pendingPosts.filter((_, i) => i !== idx));
  };

  // ✅ helpful (restricted per user)
  const increaseHelpful = (postId) => {
    if (!loggedInUser) {
      alert("You must be logged in to mark helpful.");
      return;
    }
    if (hasUserClicked(postId)) return; // already clicked

    const newPosts = posts.map((p) =>
      p.timestamp === postId ? { ...p, helpful: p.helpful + 1 } : p
    );
    setPosts(newPosts);

    // update clicked state
    const updatedClicked = {
      ...helpfulClicked,
      [loggedInUser]: [...(helpfulClicked[loggedInUser] || []), postId]
    };
    setHelpfulClicked(updatedClicked);
    localStorage.setItem("helpfulClicked", JSON.stringify(updatedClicked));
  };

  // submit reply
  const submitReply = (idx) => {
    if (!replyText.trim()) {
      alert("Please write something before submitting.");
      return;
    }
    const newPosts = [...posts];
    newPosts[idx].replies.push({ text: replyText, author: loggedInUser || "You" });
    setPosts(newPosts);
    setReplying(null);
    setReplyText("");
  };

  // sort posts based on selected option
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "helpful") return b.helpful - a.helpful;
    if (sortBy === "newest") return b.timestamp - a.timestamp;
    return 0;
  });

  return (
    <div className="container">
      <h4>WhatsTheDifference </h4>
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
            type="text" required
            name="title"
            placeholder="Post title"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="author"
            placeholder="Your name"
            value={formData.author}
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

      {/* Pending approval */}
      {pendingPosts.length > 0 && (
        <div className="pending-section">
          <h3>Pending Approval</h3>
          {pendingPosts.map((post, idx) => (
            <div className="pending-post" key={idx}>
              <span>
                <strong>{post.title}</strong> by {post.author}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Sorting dropdown */}
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
        {sortedPosts.map((post, idx) => (
          <article className="post" key={idx}>
            <div className="post-header">
              <span>{post.title}</span>
              <span className="muted">{formatDate(post.timestamp)}</span>
            </div>
            <div className="post-body">
              <div className="user">
                <div className="avatar">{post.author.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <strong>{post.author}</strong>{" "}
                  <span className="tag">Senior Student</span>
                  <br />
                </div>
              </div>

              <div className="body-text">{post.content}</div>

              <div className="actions">
                <button
                  onClick={() => increaseHelpful(post.timestamp)}
                  disabled={hasUserClicked(post.timestamp)}
                  style={{
                    color: hasUserClicked(post.timestamp) ? "gray" : "inherit",
                    cursor: hasUserClicked(post.timestamp)
                      ? "not-allowed"
                      : "pointer"
                  }}
                >
                  👍 Helpful ({post.helpful})
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

              {post.replies.length > 0 && (
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
    </div>
  );
};

export default WhatsTheDifference;
