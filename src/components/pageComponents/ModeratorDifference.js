import { useEffect, useState } from "react";
import { apiRequest } from "../apiComponents/api";
import "./WhatstheDifference_style.css";

const ModeratorDifference = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    if (userData) {
      fetchPosts();

      // Polling every 5 seconds
      const intervalId = setInterval(fetchPosts, 5000);

      // Listen for new posts created by seniors
      const handleStorage = (event) => {
        if (event.key === "newWTDPost") {
          fetchPosts();
        }
      };
      window.addEventListener("storage", handleStorage);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const queryParams = filter !== "all" ? { status: filter } : {};
      const data = await apiRequest("/api/wtd/posts/", "GET", null, queryParams);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch posts error:", err);
      setError("Failed to load posts: " + err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      setError("");
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (post.status === "pending") {
        await apiRequest(`/api/wtd/posts/${postId}/approve/`, "POST");
        await fetchPosts();
      } else setError("Only pending posts can be approved.");
    } catch (err) {
      console.error("❌ Approve error:", err);
      setError("Failed to approve post: " + err.message);
    }
  };

  const handleReject = async (postId) => {
    try {
      setError("");
      await apiRequest(`/api/wtd/posts/${postId}/reject/`, "POST");
      await fetchPosts();
    } catch (err) {
      console.error("❌ Reject error:", err);
      setError("Failed to reject post: " + err.message);
    }
  };

  const getInitials = (username) => username ? username.charAt(0).toUpperCase() : "U";

  const getStatusTag = (status) => {
    const statusConfig = {
      approved: { text: "Approved", class: "approved" },
      pending: { text: "Pending Review", class: "pending" },
      rejected: { text: "Rejected", class: "rejected" }
    };
    const config = statusConfig[status] || { text: status, class: "default" };
    return <span className={`tag ${config.class}`}>{config.text}</span>;
  };

  const getStatusCounts = () => ({
    pending: posts.filter((post) => post.status === "pending").length,
    approved: posts.filter((post) => post.status === "approved").length,
    rejected: posts.filter((post) => post.status === "rejected").length,
    total: posts.length
  });

  const statusCounts = getStatusCounts();

  if (!user) return <div className="container"><div style={{ textAlign: "center", padding: "40px" }}><h4>Please log in to access moderator features</h4></div></div>;

  if (user?.profile?.student_type !== "moderator" && user?.email !== "mialeroux@gmail.com") {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h4>Access Denied</h4>
          <p>This page is only accessible to moderators.</p>
          <p>Your email: <strong>{user?.email || "unknown"}</strong></p>
          <p>Your role: <strong>{user?.profile?.student_type || "unknown"}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h4>Moderator Dashboard - Post Management</h4>
      <p className="wdifference-caption">Review, approve, or reject student submissions</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "#fff3cd", padding: "15px", borderRadius: "8px", textAlign: "center", color: "#856404" }}>
          <h3>{statusCounts.pending}</h3>
          <p>Pending Review</p>
        </div>
        <div style={{ background: "#d1f7d6", padding: "15px", borderRadius: "8px", textAlign: "center", color: "#155724" }}>
          <h3>{statusCounts.approved}</h3>
          <p>Approved</p>
        </div>
        <div style={{ background: "#f8d7da", padding: "15px", borderRadius: "8px", textAlign: "center", color: "#721c24" }}>
          <h3>{statusCounts.rejected}</h3>
          <p>Rejected</p>
        </div>
        <div style={{ background: "#e8f4fd", padding: "15px", borderRadius: "8px", textAlign: "center", color: "#0b2f4f" }}>
          <h3>{statusCounts.total}</h3>
          <p>Total Posts</p>
        </div>
      </div>

      {/* Filter */}
      <div className="sort-controls">
        <label><strong>Filter by Status:</strong></label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Posts ({statusCounts.total})</option>
          <option value="pending">Pending Review ({statusCounts.pending})</option>
          <option value="approved">Approved ({statusCounts.approved})</option>
          <option value="rejected">Rejected ({statusCounts.rejected})</option>
        </select>
        <button className="reply-btn" onClick={fetchPosts} disabled={loading}>🔄 Refresh</button>
      </div>

      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "4px", marginBottom: "20px", border: "1px solid #f5c6cb" }}>{error}</div>}

      {/* Posts */}
      <div className="posts-container">
        {loading && <div style={{ textAlign: "center", padding: "20px" }}>Loading posts...</div>}

        {!loading && posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <span>Post #{post.id} • By {post.author_username}</span>
              {getStatusTag(post.status)}
            </div>
            <div className="post-body">
              <div className="user">
                <div className="avatar">{getInitials(post.author_username)}</div>
                <div className="user-info">
                  <strong>{post.author_username}</strong>
                  <small>Posted on {new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              </div>
              <h3>{post.title}</h3>
              <div className="body-text">{post.content}</div>

              <div className="actions" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <span>👍 {post.helpful_count} helpful votes</span>
                {post.status === "pending" && <button className="reply-btn" style={{ background: "#28a745" }} onClick={() => handleApprove(post.id)}>✅ Approve</button>}
                <button className="reply-btn" style={{ background: "#dc3545" }} onClick={() => handleReject(post.id)}>❌ Reject</button>
              </div>
            </div>
          </div>
        )) : !loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <h3>No posts found</h3>
            <p>No {filter} posts available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDifference;
