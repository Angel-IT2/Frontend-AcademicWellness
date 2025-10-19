import { useEffect, useState } from "react";
import { apiRequest } from "../apiComponents/api";
import "./WhatstheDifference_style.css";

const SeniorDifference = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      // Seniors can see their own posts and approved posts
      const data = await apiRequest("/api/wtd/posts/", "GET", null, { mine: "1" });
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (newPost.title.trim() === "" || newPost.content.trim() === "") {
      setError("Please fill in both title and content");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiRequest("/api/wtd/posts/", "POST", {
        title: newPost.title,
        content: newPost.content
      });
      
      setNewPost({ title: "", content: "" });
      setShowForm(false);
      await fetchPosts(); // Refresh posts
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      approved: { text: "Approved", class: "approved" },
      pending: { text: "Pending Review", class: "pending" },
      rejected: { text: "Rejected", class: "rejected" }
    };
    
    const config = statusConfig[status] || { text: status, class: "default" };
    return <span className={`tag ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="container">
      <h4>What's The Difference - Senior Hub</h4>
      <p className="wdifference-caption">Share your knowledge and guide first-year students</p>

      {/* Senior-specific welcome */}
      <div style={{ 
        background: '#d1f7d6', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #a3e9a4'
      }}>
        <h3>🌟 Welcome, Senior Student!</h3>
        <p>Share your academic experiences and insights to help first-year students navigate university life. Your posts will be reviewed by moderators before being published.</p>
      </div>

      {/* Post Creation */}
      <button 
        id="toggleFormBtn" 
        onClick={() => setShowForm(!showForm)}
        disabled={loading}
      >
        {showForm ? "Cancel" : "Create New Post"}
      </button>

      {showForm && (
        <div className="new-post">
          <h2>Share Your Academic Insight</h2>
          <input
            type="text"
            placeholder="Post Title (e.g., Time Management Tips)"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            disabled={loading}
          />
          <textarea
            placeholder="Share your experience, advice, or answer common questions..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            rows="4"
            disabled={loading}
          />
          <button onClick={handlePost} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* My Posts */}
      <div className="posts-container">
        <h3>Your Posts</h3>
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading your posts...</div>}
        
        {!loading && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <span>Your Post #{post.id}</span>
                {getStatusTag(post.status)}
              </div>
              
              <div className="post-body">
                <div className="user">
                  <div className="avatar">
                    {getInitials(post.author_username)}
                  </div>
                  <div className="user-info">
                    <strong>You</strong>
                    <small>{new Date(post.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
                
                <h3>{post.title}</h3>
                <div className="body-text">
                  {post.content}
                </div>
                
                <div className="actions">
                  <span>👍 {post.helpful_count} first-years found this helpful</span>
                  {post.status === "pending" && (
                    <span style={{ color: '#856404', fontStyle: 'italic' }}>
                      ⏳ Awaiting moderator approval
                    </span>
                  )}
                  {post.status === "rejected" && (
                    <span style={{ color: '#721c24', fontStyle: 'italic' }}>
                      ❌ Not approved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h3>No posts yet</h3>
              <p>Create your first post to share your knowledge with first-year students!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SeniorDifference;