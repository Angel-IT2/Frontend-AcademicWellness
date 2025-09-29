import React, { useState, useRef, useEffect } from 'react';
import './AcademicChatboxes.css';

const AcademicChatboxes = () => {
  const [activeChannel, setActiveChannel] = useState('#General');
  const [channels, setChannels] = useState([
    { id: '#General', name: 'General Lounge', description: 'General academic discussions', unread: 0 },
    { id: '#CS101', name: 'CS101 - Programming', description: 'Introduction to Programming', unread: 1 },
  ]);
  const [messages, setMessages] = useState({
    '#General': [],
    '#CS101': [],
  });

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const membersRef = useRef(null);

  const activeMembers = [
    { name: 'John Student', avatar: '👨‍🎓', status: 'online', role: 'Student' },
    { name: 'Sarah Smart', avatar: '👩‍🎓', status: 'online', role: 'TA' },
    { name: 'Mike Scholar', avatar: '👨‍💻', status: 'away', role: 'Student' },
    { name: 'Emily Learner', avatar: '👩‍💼', status: 'online', role: 'Student' },
    { name: 'Dr. Smith', avatar: '👨‍🏫', status: 'online', role: 'Professor' },
  ];

  const announcements = [
    { title: 'Midterm Schedule', content: 'Midterm examinations schedule has been posted on the student portal.', time: '2 hours ago', important: true },
    { title: 'Library Hours Extended', content: 'Extended library hours during exam period: 7 AM - 11 PM.', time: '1 day ago', important: false },
    { title: 'Academic Integrity', content: 'Remember to maintain academic integrity in all collaborations.', time: '2 days ago', important: true }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  // --- Send Message ---
  const handleSendMessage = () => {
    if (!newMessage.trim() && !attachedFile) return;

    const newMsg = {
      sender: 'You',
      avatar: '🧑‍🎓',
      text: newMessage,
      file: attachedFile ? { name: attachedFile.name, url: URL.createObjectURL(attachedFile) } : null,
      time: 'Just now',
      role: 'Student',
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg]
    }));

    setNewMessage('');
    setAttachedFile(null);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.trim().length > 0);
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  const applyFormatting = (format) => {
    if (!newMessage) return;
    let formatted = '';
    switch (format) {
      case 'bold': formatted = `**${newMessage}**`; break;
      case 'italic': formatted = `_${newMessage}_`; break;
      case 'code': formatted = `\`${newMessage}\``; break;
      default: formatted = newMessage;
    }
    setNewMessage(formatted);
  };

  const insertSampleQuestion = () => {
    const questions = [
      "Can someone explain the main concepts from today's lecture?",

    ];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setNewMessage(randomQuestion);
  };

  const filteredChannels = channels.filter(ch => ch.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const scrollToMembers = () => { membersRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  const getOnlineCount = () => activeMembers.filter(m => m.status === 'online').length;
  const getChannelDescription = () => channels.find(ch => ch.id === activeChannel)?.description || '';

  // --- NEW CHANNEL FUNCTION ---
  const createNewChannel = () => {
    const name = prompt('Enter new channel name (e.g., MATH303):');
    if (!name || !name.trim()) return;
    const id = `#${name.replace(/\s+/g, '').toUpperCase()}`;
    if (channels.find(ch => ch.id === id)) {
      alert('Channel already exists!');
      return;
    }
    const newChannel = {
      id,
      name,
      description: 'New academic chatbox',
      unread: 0
    };
    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    setActiveChannel(id);
  };

  return (
    <div className="chatbox-wrapper">
      {/* Header */}
      <header className="chatbox-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">ACADEMIC CHATBOXES</span>
          </div>
          <div className="header-subtitle">Your Platform for Academic Collaboration</div>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat"><span className="stat-number">{getOnlineCount()}</span> Online</div>
            <div className="stat"><span className="stat-number">{channels.length}</span> Chatboxes</div>
          </div>
        </div>
      </header>

      <div className="chatbox-container">
        {/* Left Sidebar */}
        <div className="chatbox-sidebar">
          <div className="sidebar-header">
            <h3>Academic Chatboxes</h3>
            <button className="new-chatbox-btn" onClick={createNewChannel}>+ New</button>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search chatboxes..."
              className="search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="channels-list">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${channel.id === activeChannel ? 'active' : ''}`}
                onClick={() => setActiveChannel(channel.id)}
              >
                <div className="channel-icon">#</div>
                <div className="channel-info">
                  <div className="channel-name">{channel.name}</div>
                  <div className="channel-description">{channel.description}</div>
                </div>
                {channel.unread > 0 && <div className="unread-badge">{channel.unread}</div>}
              </div>
            ))}
          </div>
          <div className="user-profile">
            <div className="user-avatar">🧑‍🎓</div>
            <div className="user-info">
              <div className="user-name">You</div>
              <div className="user-status">Online • Student</div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chatbox-main">
          <div className="chat-header">
            <div className="channel-header">
              <h3>{activeChannel}</h3>
              <p>{getChannelDescription()}</p>
            </div>
            <div className="chat-actions">
              <button className="chat-action-btn" onClick={() => alert('Search feature coming soon!')} title="Search">🔍</button>
              <button className="chat-action-btn" onClick={() => alert('No notifications yet')} title="Notifications">🔔</button>
              <button className="chat-action-btn" onClick={scrollToMembers} title="Members">👥</button>
            </div>
          </div>

          <div className="chatbox-messages">
            {messages[activeChannel]?.length > 0 ? (
              messages[activeChannel].map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender === 'You' ? 'sent' : 'received'} ${msg.role.toLowerCase()}`}>
                  <span className="avatar">{msg.avatar}</span>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender">{msg.sender}</span>
                      {msg.role !== 'Student' && msg.role !== 'You' && <span className="role-badge">{msg.role}</span>}
                      <span className="timestamp">{msg.time}</span>
                    </div>
                    <div className="text">{msg.text}</div>
                    {msg.file && (
                      <a href={msg.file.url} download={msg.file.name} className="attached-file">
                        📎 {msg.file.name}
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h4>No messages yet</h4>
                <p>Start the conversation by sending the first message!</p>
                <button className="start-convo-btn" onClick={insertSampleQuestion}>Start a Conversation</button>
              </div>
            )}
            {isTyping && (
              <div className="typing-indicator">
                <span className="avatar">🧑‍🎓</span>
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input-container">
            <div className="input-toolbar">
              <button className="toolbar-btn" onClick={() => applyFormatting('bold')}>B</button>
              <button className="toolbar-btn" onClick={() => applyFormatting('italic')}>I</button>
              <button className="toolbar-btn" onClick={() => applyFormatting('code')}>{'</>'}</button>
              <button className="toolbar-btn" onClick={triggerFileInput}>📎</button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileAttach} />
              {attachedFile && <span>{attachedFile.name}</span>}
            </div>
            <div className="input-wrapper">
              <textarea
                placeholder={`Message ${activeChannel}... (Shift+Enter for new line)`}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                rows="1"
              />
              <button className="sample-question-btn" onClick={insertSampleQuestion} title="Insert sample question">💡</button>
            </div>
            <button className="send-button" onClick={handleSendMessage} disabled={!newMessage.trim() && !attachedFile}>Send ⏎</button>
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="chatbox-info">
          <div className="info-section">
            <h4>📌 Announcements</h4>
            <div className="announcements-list">
              {announcements.map((announcement, idx) => (
                <div key={idx} className={`announcement-item ${announcement.important ? 'important' : ''}`}>
                  <strong>{announcement.title}</strong>
                  <p>{announcement.content}</p>
                  <span className="announcement-time">{announcement.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="info-section">
            <h4>👥 Active Members ({getOnlineCount()})</h4>
            <div className="members-list" ref={membersRef}>
              {activeMembers.map(member => (
                <div key={member.name} className="member-item">
                  <span className="member-avatar" title={member.role}>{member.avatar}</span>
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                  <span className={`status-indicator ${member.status}`} title={member.status}></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicChatboxes;
