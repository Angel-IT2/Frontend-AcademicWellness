import { useEffect, useState } from "react";
import { apiRequest } from "../apiComponents/api";
import "./WhatstheDifference_style.css";

const FirstYearDifference = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPosts();

    const handleStorage = (event) => {
      if (event.key === "newWTDPost") fetchPosts();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/api/wtd/posts/", "GET", null, { status: "approved" });
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (postId) => {
    try {
      setError("");
      await apiRequest(`/api/wtd/posts/${postId}/helpful/`, "POST");
      fetchPosts();
    } catch (err) {
      console.error("Error marking helpful:", err);
      setError("Failed to mark as helpful: " + err.message);
    }
  };

  const getInitials = (username) => (username ? username.charAt(0).toUpperCase() : "U");

  return (
    <div className="container">
      <h4>What's The Difference - First Year Hub</h4>
      <p className="wdifference-caption">Learn from experienced students and get answers to your questions</p>

      <button className="reply-btn" onClick={fetchPosts} disabled={loading} style={{ marginBottom: "20px" }}>
        🔄 Refresh Posts
      </button>

      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>{error}</div>}

      <div className="posts-container">
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading posts...</div>}
        {!loading && posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <span>Question #{post.id}</span>
              <span className="tag approved">Approved</span>
            </div>
            <div className="post-body">
              <div className="user">
                <div className="avatar">{getInitials(post.author_username)}</div>
                <div className="user-info">
                  <strong>{post.author_username}</strong>
                  <small>{new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              </div>
              <h3>{post.title}</h3>
              <div className="body-text">{post.content}</div>
              <div className="actions">
                <button onClick={() => handleHelpful(post.id)}>👍 Helpful ({post.helpful_count})</button>
                <button className="reply-btn">💬 Ask Follow-up Question</button>
              </div>
            </div>
          </div>
        )) : !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No approved posts yet</h3>
            <p>Check back later for helpful insights from senior students!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstYearDifference;
