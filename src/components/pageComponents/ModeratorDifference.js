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
    }
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      
      let queryParams = {};
      if (filter !== "all") {
        queryParams.status = filter;
      }

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
      await apiRequest(`/api/wtd/posts/${postId}/approve/`, "POST");
      await fetchPosts();
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

  const getStatusCounts = () => {
    const counts = {
      pending: posts.filter(post => post.status === "pending").length,
      approved: posts.filter(post => post.status === "approved").length,
      rejected: posts.filter(post => post.status === "rejected").length,
      total: posts.length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // FIXED: Check user.profile.student_type instead of user.student_type
  if (!user) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h4>Please log in to access moderator features</h4>
        </div>
      </div>
    );
  }

  if (user?.profile?.student_type !== "moderator") {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h4>Access Denied</h4>
          <p>This page is only accessible to moderators.</p>
          <p>Your role: <strong>{user?.profile?.student_type || 'unknown'}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h4>Moderator Dashboard - Post Management</h4>
      <p className="wdifference-caption">Review, approve, or reject student submissions</p>

      {/* Moderator Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#856404' }}>{statusCounts.pending}</h3>
          <p style={{ margin: '5px 0 0 0', color: '#856404' }}>Pending Review</p>
        </div>
        <div style={{ background: '#d1f7d6', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#155724' }}>{statusCounts.approved}</h3>
          <p style={{ margin: '5px 0 0 0', color: '#155724' }}>Approved</p>
        </div>
        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#721c24' }}>{statusCounts.rejected}</h3>
          <p style={{ margin: '5px 0 0 0', color: '#721c24' }}>Rejected</p>
        </div>
        <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#0b2f4f' }}>{statusCounts.total}</h3>
          <p style={{ margin: '5px 0 0 0', color: '#0b2f4f' }}>Total Posts</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="sort-controls">
        <label><strong>Filter by Status:</strong></label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Posts ({statusCounts.total})</option>
          <option value="pending">Pending Review ({statusCounts.pending})</option>
          <option value="approved">Approved ({statusCounts.approved})</option>
          <option value="rejected">Rejected ({statusCounts.rejected})</option>
        </select>
        <button className="reply-btn" onClick={fetchPosts} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

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
                <span>Post #{post.id} • By {post.author_username}</span>
                {getStatusTag(post.status)}
              </div>
              
              <div className="post-body">
                <div className="user">
                  <div className="avatar">
                    {getInitials(post.author_username)}
                  </div>
                  <div className="user-info">
                    <strong>{post.author_username}</strong>
                    <small>Posted on {new Date(post.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
                
                <h3>{post.title}</h3>
                <div className="body-text">
                  {post.content}
                </div>
                
                <div className="actions">
                  <span>👍 {post.helpful_count} helpful votes</span>
                  
                  {/* Moderator Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                    {post.status === "pending" && (
                      <>
                        <button 
                          className="reply-btn"
                          onClick={() => handleApprove(post.id)}
                          style={{ background: '#28a745' }}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="reply-btn"
                          onClick={() => handleReject(post.id)}
                          style={{ background: '#dc3545' }}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    
                    {(post.status === "approved" || post.status === "rejected") && (
                      <button className="reply-btn">
                        👁️ View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h3>No posts found</h3>
              <p>No {filter ? filter : ''} posts available.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ModeratorDifference;