// 1. IMPORT useCallback from react
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AcademicChatboxes.css';

const API_BASE_URL = 'https://backend-academicwellness.onrender.com/api';

// --- Helper Functions to interact with localStorage ---
const getToken = () => localStorage.getItem('token');

const getCurrentUser = () => {
  try {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};


const AcademicChatboxes = () => {
  const [activeChannel, setActiveChannel] = useState('#General');
  // 2. 'setChannels' is removed as it's not used
  const [channels] = useState([
    { id: '#General', name: 'General Lounge', description: 'General academic discussions', unread: 0 },
  ]);
  const [messages, setMessages] = useState({ '#General': [] });
  const [newMessage, setNewMessage] = useState('');
  // 3. 'isTyping' state is removed as it's not used
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);

  const currentUser = getCurrentUser(); 
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const transformApiMessage = (apiMsg) => {
    const isCurrentUser = currentUser ? apiMsg.author_username === currentUser.username : false;
    return {
      id: apiMsg.id,
      sender: isCurrentUser ? "You" : apiMsg.author_username,
      avatar: '👤', 
      text: apiMsg.content,
      time: new Date(apiMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(apiMsg.created_at),
      isCurrentUser, 
    };
  };
  
  // 4. WRAP fetchMessages in useCallback
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    const token = getToken();
    if (!token) {
      console.error("Authentication token not found. Please log in.");
      setIsLoading(false);
      return;
    }
    if (activeChannel !== '#General') {
        setMessages(prev => ({ ...prev, [activeChannel]: [] }));
        setIsLoading(false);
        return;
    };

    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      const formattedMessages = data.results.map(transformApiMessage);
      formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(prev => ({ ...prev, '#General': formattedMessages }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
    // 5. Add its own dependencies
  }, [activeChannel]);

  const handleSendMessage = async () => {
    const token = getToken();
    if (!newMessage.trim() || !token) return;
    
    try {
        await fetch(`${API_BASE_URL}/chat/messages/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content: newMessage }),
        });
        setNewMessage('');
        // No more setIsTyping
        await fetchMessages();
    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  const handleConfirmEdit = async () => {
    const token = getToken();
    if (!newMessage.trim() || !editingMessageId || !token) return;
    try {
      await fetch(`${API_BASE_URL}/chat/messages/${editingMessageId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage }),
      });
      handleCancelEdit();
      await fetchMessages();
    } catch(error) {
      console.error("Error updating message:", error);
    }
  };

  const handleStartEdit = (message) => {
    setIsEditing(true);
    setEditingMessageId(message.id);
    setNewMessage(message.text);
    inputRef.current?.focus();
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMessageId(null);
    setNewMessage('');
  };

  const handleSubmit = () => {
    if (isEditing) {
      handleConfirmEdit();
    } else {
      handleSendMessage();
    }
  };
  
  const handleDeleteMessage = (messageId) => {
  

  // This is the frontend-only "delete" logic.
  // It filters the message out of the current state, making it disappear from the UI.
  setMessages(prevMessages => {
    // Create a new copy of the messages for the active channel
    const updatedChannelMessages = prevMessages[activeChannel].filter(
      (msg) => msg.id !== messageId
    );

    // Return the new state object
    return {
      ...prevMessages,
      [activeChannel]: updatedChannelMessages,
    };
  });

  // We are NOT calling fetchMessages() because it would just add the message back from the server.
};

  // --- Effects ---
  useEffect(() => {
    fetchMessages();
    // 6. ADD fetchMessages to the dependency array
  }, [fetchMessages]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    // No more setIsTyping
  };
  
  const createNewChannel = () => alert("Creating new channels is not supported by the backend API.");
  const getChannelDescription = () => channels.find(ch => ch.id === activeChannel)?.description || '';
  

  // The JSX below is unchanged
  return (
    <div className="chatbox-wrapper">
      <header className="chatbox-header">
        <div className="header-left">
          <div className="logo"><span className="logo-icon">🎓</span><span className="logo-text">ACADEMIC CHATBOXES</span></div>
          <div className="header-subtitle">Your Platform for Academic Collaboration</div>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat"><span className="stat-number">{channels.length}</span> Chatboxes</div>
          </div>
        </div>
      </header>

      <div className="chatbox-container-simplified">
        <div className="chatbox-sidebar">
            <div className="chatbox-sidebar-header">
                <h3>Academic Chatboxes</h3>
                <button className="new-chatbox-btn" onClick={createNewChannel}>+ New</button>
            </div>
            <div className="channels-list">
                {channels.map(channel => (
                <div key={channel.id} className={`channel-item ${channel.id === activeChannel ? 'active' : ''}`} onClick={() => setActiveChannel(channel.id)}>
                    <div className="channel-icon">#</div>
                    <div className="channel-info">
                        <div className="channel-name">{channel.name}</div>
                        <div className="channel-description">{channel.description}</div>
                    </div>
                </div>
                ))}
            </div>
             <div className="user-profile">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                <div className="user-name">{currentUser?.username || 'Guest'}</div>
                <div className="user-status">Online • {currentUser?.profile?.student_type || 'Student'}</div>
                </div>
            </div>
        </div>

        <div className="chatbox-main">
          <div className="chat-header">
            <div className="channel-header"><h3>{activeChannel}</h3><p>{getChannelDescription()}</p></div>
          </div>
        
          <div className="chatbox-messages">
            {isLoading ? (
              <div className="empty-state"><h4>Loading messages...</h4></div>
            ) : messages[activeChannel]?.length > 0 ? (
              messages[activeChannel].map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.isCurrentUser ? 'sent' : 'received'}`}>
                  <span className="avatar">{msg.avatar}</span>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender">{msg.sender}</span>
                      <span className="timestamp">{msg.time}</span>
                    </div>
                    <div className="text">{msg.text}</div>
                    <div className="message-actions">
                        {msg.isCurrentUser && (
                            <button className="action-btn" onClick={() => handleStartEdit(msg)}>Edit</button>
                        )}

                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h4>No messages yet</h4>
                <p>Start the conversation by sending the first message!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input-container">
            {isEditing && (
              <div className="editing-indicator">
                Editing message...
              </div>
            )}
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                placeholder={`Message ${activeChannel}...`}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                rows="1"
                disabled={activeChannel !== '#General'} 
              />
            </div>
            <div className="input-actions-wrapper">
              {isEditing ? (
                <>
                  <button className="cancel-edit-btn" onClick={handleCancelEdit}>Cancel</button>
                  <button 
                      className="send-button" 
                      onClick={handleSubmit}
                      disabled={!newMessage.trim() || activeChannel !== '#General'}>
                      Save ✓
                  </button>
                </>
              ) : (
                <>
                  <div style={{ flexGrow: 1 }}></div>
                  <button 
                      className="send-button" 
                      onClick={handleSubmit} 
                      disabled={!newMessage.trim() || activeChannel !== '#General'}>
                      Send ⏎
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicChatboxes;