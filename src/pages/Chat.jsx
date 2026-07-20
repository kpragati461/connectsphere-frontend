import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getConversations, startConversation, getMessages, sendMessage } from '../api/chatApi';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [error, setError] = useState('');
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    connectWebSocket();
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
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
      onDisconnect: () => console.log('WebSocket disconnected'),
    });
    client.activate();
    stompClient.current = client;
  };

  const subscribeToConversation = (convId) => {
    if (!stompClient.current?.connected) return;
    stompClient.current.subscribe(
      `/topic/conversation.${convId}`,
      (message) => {
        const received = JSON.parse(message.body);
        setMessages((prev) => [...prev, received]);
      }
    );
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch {
      setError('Failed to load conversations');
    }
  };

  const openConversation = async (convId) => {
    setActiveConvId(convId);
    try {
      const res = await getMessages(convId);
      setMessages(res.data);
      subscribeToConversation(convId);
    } catch {
      setError('Failed to load messages');
    }
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

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: '#f9fafb' }}>

      {/* Left panel — conversation list */}
      <div style={{
        width: '300px', background: 'white',
        borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>Messages</h3>
          <form onSubmit={handleStartConversation} style={{ display: 'flex', gap: '6px' }}>
            <input
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Start chat with..."
              style={{
                flex: 1, padding: '6px 10px', borderRadius: '8px',
                border: '1px solid #d1d5db', fontSize: '13px'
              }}
            />
            <button type="submit" style={{
              padding: '6px 10px', background: '#6366f1',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px'
            }}>+</button>
          </form>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && (
            <p style={{ padding: '1rem', color: '#9ca3af', fontSize: '13px' }}>
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => openConversation(conv.id)}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                background: activeConvId === conv.id ? '#f5f3ff' : 'white',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#6366f1', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white',
                fontWeight: 'bold', flexShrink: 0
              }}>
                {conv.otherUsername?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  @{conv.otherUsername}
                </div>
                <div style={{
                  fontSize: '12px', color: '#9ca3af',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {conv.lastMessage}
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <span style={{
                  background: '#6366f1', color: 'white',
                  borderRadius: '50%', fontSize: '10px',
                  width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — message thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeConvId ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#9ca3af'
          }}>
            Select a conversation or start a new one
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: '1rem 1.5rem', background: 'white',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#6366f1', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: 'bold'
              }}>
                {activeConv?.otherUsername?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: '500' }}>@{activeConv?.otherUsername}</div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {messages.map((msg) => {
                const isOwn = msg.senderUsername === user?.username;
                return (
                  <div key={msg.id} style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      maxWidth: '70%', padding: '8px 12px',
                      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isOwn ? '#6366f1' : 'white',
                      color: isOwn ? 'white' : '#111827',
                      border: isOwn ? 'none' : '1px solid #e5e7eb',
                      fontSize: '14px'
                    }}>
                      <div>{msg.content}</div>
                      <div style={{
                        fontSize: '10px', marginTop: '4px',
                        color: isOwn ? 'rgba(255,255,255,0.7)' : '#9ca3af',
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

            {/* Message input */}
            <div style={{
              padding: '1rem', background: 'white',
              borderTop: '1px solid #e5e7eb'
            }}>
              {error && <p style={{ color: 'red', fontSize: '12px', margin: '0 0 8px' }}>{error}</p>}
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '24px',
                    border: '1px solid #d1d5db', fontSize: '14px', outline: 'none'
                  }}
                />
                <button type="submit" style={{
                  padding: '10px 20px', background: '#6366f1',
                  color: 'white', border: 'none', borderRadius: '24px',
                  cursor: 'pointer', fontSize: '14px'
                }}>Send</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}