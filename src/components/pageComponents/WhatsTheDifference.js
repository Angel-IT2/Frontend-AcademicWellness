import { useEffect, useState } from "react";
import { apiRequest } from "../apiComponents/api";
import "./WhatstheDifference_style.css"; // Add .css extension

const WhatsTheDifference = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    console.log("👤 User loaded:", userData);
    
    if (userData) {
      fetchPosts();
    } else {
      setError("Please log in to view posts");
    }
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      
      let queryParams = {};
      
      // Set query parameters based on user role
      if (user?.student_type === "Senior") {
        queryParams.mine = "1";
      }
      // For other roles, fetch approved posts by default

      console.log("📋 Fetching posts for role:", user?.student_type);
      const data = await apiRequest("/api/wtd/posts/", "GET", null, queryParams);
      console.log("📝 Posts received:", data);
      
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch posts error:", err);
      setError("Failed to load posts: " + err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (newPost.title.trim() === "" || newPost.content.trim() === "") {
      setError("Please fill in both title and content");
      return;
    }

    if (user?.student_type !== "Senior") {
      setError("Only Senior students can create posts");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      console.log("📤 Creating new post:", newPost);
      await apiRequest("/api/wtd/posts/", "POST", {
        title: newPost.title,
        content: newPost.content
      });
      
      setNewPost({ title: "", content: "" });
      setShowForm(false);
      await fetchPosts(); // Refresh posts
    } catch (err) {
      console.error("❌ Create post error:", err);
      setError("Failed to create post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (postId) => {
    if (user?.student_type !== "First-year") {
      setError("Only First-year students can mark posts as helpful");
      return;
    }

    try {
      setError("");
      console.log("👍 Marking post as helpful:", postId);
      await apiRequest(`/api/wtd/posts/${postId}/helpful/`, "POST");
      await fetchPosts(); // Refresh to update helpful count
    } catch (err) {
      console.error("❌ Helpful error:", err);
      setError("Failed to mark as helpful: " + err.message);
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

  if (!user) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h4>Please log in to view this page</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h4>What's The Difference</h4>
      <p className="wdifference-caption">Share insights and learn from fellow students</p>

      {/* Debug info */}
      <div style={{ 
        background: '#e8f4fd', 
        padding: '10px', 
        marginBottom: '20px', 
        borderRadius: '4px',
        fontSize: '14px',
        border: '1px solid #b6d7fe'
      }}>
        <strong>Debug Info:</strong> Logged in as <strong>{user.student_type}</strong> | 
        User: {user.email} | 
        Token: {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}
      </div>

      {/* Post Creation - Only for Seniors */}
      {user.student_type === "Senior" && (
        <button 
          id="toggleFormBtn" 
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? "Cancel" : "Create New Post"}
        </button>
      )}

      {/* New Post Form */}
      {showForm && user.student_type === "Senior" && (
        <div className="new-post">
          <h2>Create New Post</h2>
          <input
            type="text"
            placeholder="Post Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            disabled={loading}
          />
          <textarea
            placeholder="Share your insight or ask a question..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            rows="4"
            disabled={loading}
          />
          <button onClick={handlePost} disabled={loading}>
            {loading ? "Posting..." : "Submit Post"}
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

      {/* Posts List */}
      <div className="posts-container">
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div>Loading posts...</div>
          </div>
        )}
        
        {!loading && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <span>Question #{post.id}</span>
                {getStatusTag(post.status)}
              </div>
              
              <div className="post-body">
                <div className="user">
                  <div className="avatar">
                    {getInitials(post.author_username)}
                  </div>
                  <div className="user-info">
                    <strong>{post.author_username}</strong>
                    <small>{new Date(post.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
                
                <h3>{post.title}</h3>
                <div className="body-text">
                  {post.content}
                </div>
                
                <div className="actions">
                  {user.student_type === "First-year" && (
                    <button 
                      onClick={() => handleHelpful(post.id)}
                      disabled={loading}
                    >
                      👍 Helpful ({post.helpful_count})
                    </button>
                  )}
                  
                  {user.student_type !== "First-year" && (
                    <span>👍 {post.helpful_count} helpful</span>
                  )}
                  
                  <button className="reply-btn" disabled={loading}>
                    💬 Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h3>No posts found</h3>
              <p>
                {user.student_type === "Senior" 
                  ? "Be the first to create a post!" 
                  : "No posts available yet. Check back later!"}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WhatsTheDifference;