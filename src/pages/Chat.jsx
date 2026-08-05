import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getConversations, startConversation, getMessages, sendMessage } from '../api/chatApi';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, Plus, MessageSquare, Bookmark } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [error, setError] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    connectWebSocket();
    return () => { if (stompClient.current) stompClient.current.deactivate(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => console.log('WebSocket connected'),
    });
    client.activate();
    stompClient.current = client;
  };

  const subscribeToConversation = (convId) => {
    if (!stompClient.current?.connected) return;
    stompClient.current.subscribe(`/topic/conversation.${convId}`, (msg) => {
      const received = JSON.parse(msg.body);
      setMessages(prev => [...prev, received]);
    });
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch {}
  };

  const openConversation = async (convId) => {
    setActiveConvId(convId);
    try {
      const res = await getMessages(convId);
      setMessages(res.data);
      subscribeToConversation(convId);
    } catch {}
  };

  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    try {
      const res = await startConversation(searchUsername);
      const convId = res.data.conversationId;
      await loadConversations();
      openConversation(convId);
      setSearchUsername('');
      setShowNewChat(false);
    } catch {
      setError('User not found');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;
    try {
      await sendMessage(activeConvId, { content: newMessage });
      setNewMessage('');
    } catch {
      setError('Failed to send message');
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 48px)',
      background: 'white', borderRadius: '12px',
      border: '1px solid #e5e7eb', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>

      {/* Left — conversation list */}
      <div style={{
        width: '280px', flexShrink: 0,
        borderRight: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Messages</h3>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: showNewChat ? '#eef2ff' : '#f9fafb',
              border: '1px solid #e5e7eb', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: showNewChat ? '#6366f1' : '#6b7280'
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* New chat form */}
        {showNewChat && (
          <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
            <form onSubmit={handleStartConversation} style={{ display: 'flex', gap: '6px' }}>
              <input
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
                placeholder="Username..."
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: '8px',
                  border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button type="submit" style={{
                padding: '7px 12px', background: '#6366f1', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
              }}>Go</button>
            </form>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0' }}>{error}</p>}
          </div>
        )}

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontSize: '13px' }}>No conversations yet</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Click + to start one</div>
            </div>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => openConversation(conv.id)}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                background: activeConvId === conv.id ? '#eef2ff' : 'white',
                borderBottom: '1px solid #f9fafb',
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = 'white'; }}
            >
              <div className="avatar" style={{
                width: '40px', height: '40px', fontSize: '15px', flexShrink: 0,
                background: `hsl(${conv.otherUsername?.charCodeAt(0) * 10}, 65%, 55%)`
              }}>
                {conv.otherUsername?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: activeConvId === conv.id ? '600' : '500',
                  fontSize: '14px', color: '#111827',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span>@{conv.otherUsername}</span>
                </div>
                <div style={{
                  fontSize: '12px', color: '#9ca3af', marginTop: '2px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {conv.lastMessage}
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <span style={{
                  background: '#6366f1', color: 'white', borderRadius: '99px',
                  fontSize: '10px', fontWeight: '600', padding: '2px 7px', flexShrink: 0
                }}>
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right — message thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeConvId ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#9ca3af'
          }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontWeight: '500', fontSize: '16px', marginBottom: '6px', color: '#374151' }}>
              Your messages
            </div>
            <div style={{ fontSize: '13px' }}>Select a conversation or start a new one</div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', gap: '12px', background: 'white'
            }}>
              <div className="avatar" style={{
                width: '38px', height: '38px', fontSize: '14px',
                background: `hsl(${activeConv?.otherUsername?.charCodeAt(0) * 10}, 65%, 55%)`
              }}>
                {activeConv?.otherUsername?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>@{activeConv?.otherUsername}</div>
                <div style={{ fontSize: '12px', color: '#10b981' }}>Active now</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px', background: '#fafafa' }}>
              {messages.map((msg, i) => {
                const isOwn = msg.senderUsername === user?.username;
                const showAvatar = i === 0 || messages[i-1]?.senderUsername !== msg.senderUsername;
                const isSharedPost = !!msg.sharedPostId;
                // Backend prefixes shared-post messages with "Shared a post: " —
                // strip that for display since the card label already says so.
                const displayContent = isSharedPost
                  ? msg.content.replace(/^Shared a post:\s*/, '')
                  : msg.content;
                return (
                  <div key={msg.id} style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '4px',
                    alignItems: 'flex-end', gap: '8px'
                  }}>
                    {!isOwn && (
                      <div className="avatar" style={{
                        width: '28px', height: '28px', fontSize: '11px', flexShrink: 0,
                        visibility: showAvatar ? 'visible' : 'hidden',
                        background: `hsl(${msg.senderUsername?.charCodeAt(0) * 10}, 65%, 55%)`
                      }}>
                        {msg.senderUsername?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '65%', padding: '9px 14px',
                      borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isOwn ? '#6366f1' : 'white',
                      color: isOwn ? 'white' : '#111827',
                      border: isOwn ? 'none' : '1px solid #e5e7eb',
                      fontSize: '14px', lineHeight: '1.4',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      overflowWrap: 'anywhere', wordBreak: 'break-word', minWidth: 0
                    }}>
                      {isSharedPost ? (
                        <div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '10px', fontWeight: '700', marginBottom: '6px',
                            color: isOwn ? 'rgba(255,255,255,0.85)' : '#6366f1',
                            textTransform: 'uppercase', letterSpacing: '0.04em'
                          }}>
                            <Bookmark size={11} /> Shared post
                          </div>
                          <div style={{
                            borderRadius: '10px', padding: '8px 10px',
                            background: isOwn ? 'rgba(255,255,255,0.15)' : '#f9fafb',
                            border: isOwn ? 'none' : '1px solid #e5e7eb',
                            fontSize: '13px', lineHeight: '1.4',
                            overflowWrap: 'anywhere', wordBreak: 'break-word'
                          }}>
                            {displayContent}
                          </div>
                        </div>
                      ) : (
                        <div>{displayContent}</div>
                      )}
                      <div style={{
                        fontSize: '10px', marginTop: '4px',
                        color: isOwn ? 'rgba(255,255,255,0.65)' : '#9ca3af',
                        textAlign: 'right'
                      }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #f3f4f6' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '24px',
                    border: '1px solid #e5e7eb', fontSize: '14px',
                    outline: 'none', background: '#f9fafb',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="submit" style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: newMessage.trim() ? '#6366f1' : '#e5e7eb',
                  border: 'none', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.15s', color: newMessage.trim() ? 'white' : '#9ca3af'
                }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}