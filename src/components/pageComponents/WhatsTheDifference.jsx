import React, { useState } from "react";
import "./WhatsTheDifference.css";

const WhatsTheDifference = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (newPost.trim() !== "") {
      setPosts([...posts, { text: newPost, helpful: 0 }]);
      setNewPost("");
    }
  };

  const handleHelpful = (index) => {
    const updatedPosts = [...posts];
    updatedPosts[index].helpful += 1;
    setPosts(updatedPosts);
  };

  return (
    <div className="wtd-container">
      <h2>What's The Difference</h2>
      <div className="new-post">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your insight..."
        />
        <button onClick={handlePost}>Post</button>
      </div>
      <div className="posts">
        {posts.map((post, index) => (
          <div key={index} className="post">
            <p>{post.text}</p>
            <button onClick={() => handleHelpful(index)}>
              Helpful ({post.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsTheDifference;
