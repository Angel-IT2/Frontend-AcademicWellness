import React, { useState } from "react";
import "./WhatstheDifference_style.css";

const WhatsTheDifference = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const formatDate = (d) => {
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
    return d.toLocaleDateString();
  };

  const [posts, setPosts] = useState([
    { title: "Assessments are heavier", author: "Sarah J", content: "Tests, Assignments and Exams carry more weight.", helpful: 5, timestamp: new Date("2025-08-30T12:00:00"), replies: [] },
    { title: "Lectures move faster", author: "Michael K", content: "Lecturers won’t slow down. Review slides before and after class.", helpful: 3, timestamp: new Date("2025-09-05T12:00:00"), replies: [] },
    { title: "You must manage your own time", author: "Lerato M", content: "Time management is crucial.", helpful: 7, timestamp: new Date("2025-09-08T12:00:00"), replies: [] },
  ]);

  const [pendingPosts, setPendingPosts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", author: "", content: "" });
  const [sortBy, setSortBy] = useState("helpful");
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addPost = () => {
    if (!formData.title || !formData.author || !formData.content) {
      alert("Please fill out all fields.");
      return;
    }
    const newPost = { ...formData, helpful: 0, timestamp: new Date(), replies: [] };

    if (user.student_type === "Moderator") {
      setPosts([newPost, ...posts]); // Moderators can post directly
    } else {
      setPendingPosts([newPost, ...pendingPosts]); // Seniors go to pending
    }

    setFormData({ title: "", author: "", content: "" });
    setShowForm(false);
  };

  const approvePost = (idx) => {
    const approved = pendingPosts[idx];
    setPosts([approved, ...posts]);
    setPendingPosts(pendingPosts.filter((_, i) => i !== idx));
  };

  const increaseHelpful = (idx) => {
    const newPosts = [...posts];
    newPosts[idx].helpful += 1;
    setPosts(newPosts);
  };

  const submitReply = (idx) => {
    if (!replyText.trim()) {
      alert("Please write something before submitting.");
      return;
    }
    const newPosts = [...posts];
    newPosts[idx].replies.push({ text: replyText, author: "You" });
    setPosts(newPosts);
    setReplying(null);
    setReplyText("");
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "helpful") return b.helpful - a.helpful;
    if (sortBy === "newest") return b.timestamp - a.timestamp;
    return 0;
  });

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
          <h2>Submit a new insight</h2>
          <input type="text" name="title" placeholder="Post title" value={formData.title} onChange={handleChange} />
          <input type="text" name="author" placeholder="Your name" value={formData.author} onChange={handleChange} />
          <textarea name="content" placeholder="Share your insight..." value={formData.content} onChange={handleChange} />
          <button onClick={addPost}>Submit Post</button>
        </div>
      )}

      {/* Pending approval only visible to Moderators */}
      {user.student_type === "Moderator" && pendingPosts.length > 0 && (
        <div className="pending-section">
          <h3>Pending Approval</h3>
          {pendingPosts.map((post, idx) => (
            <div className="pending-post" key={idx}>
              <span>
                <strong>{post.title}</strong> by {post.author}
              </span>
              <button onClick={() => approvePost(idx)}>Approve</button>
            </div>
          ))}
        </div>
      )}

      {/* Sorting dropdown */}
      <div className="sort-controls">
        <label htmlFor="sortSelect">Sort by: </label>
        <select id="sortSelect" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
                  <strong>{post.author}</strong> <span className="tag">Senior Student</span>
                </div>
              </div>

              <div className="body-text">{post.content}</div>

              <div className="actions">
                <button onClick={() => increaseHelpful(idx)}>👍 Helpful ({post.helpful})</button>
                <button>Report</button>
                <button className="reply-btn" onClick={() => setReplying(replying === idx ? null : idx)}>Reply</button>
              </div>

              {replying === idx && (
                <div className="quick-reply">
                  <textarea placeholder="Reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
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
