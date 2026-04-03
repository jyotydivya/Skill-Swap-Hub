import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { chatAPI, requestsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = [
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fef3c7', color: '#b45309' },
];
function getAv(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

let socket;

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [active, setActive]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const messagesEnd = useRef(null);

  // Build contact list from accepted requests
  useEffect(() => {
    requestsAPI.getMy().then(res => {
      const accepted = [
        ...res.data.incoming.filter(r => r.status === 'accepted'),
        ...res.data.outgoing.filter(r => r.status === 'accepted'),
      ];
      const seen = new Set();
      const contacts = [];
      accepted.forEach(r => {
        const other = r.from?._id === user?._id ? r.to : r.from;
        if (other && !seen.has(other._id)) {
          seen.add(other._id);
          contacts.push({ user: other, request: r });
        }
      });
      setContacts(contacts);
      if (contacts.length > 0) selectContact(contacts[0]);
    }).catch(() => {});
  }, []);

  // Init socket
  useEffect(() => {
    socket = io('/', { transports: ['websocket'] });
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });
    socket.on('user_typing', () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });
    return () => socket.disconnect();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getRoomId = (a, b) => [a, b].sort().join('_');

  const selectContact = async (contact) => {
    setActive(contact);
    const roomId = getRoomId(user._id, contact.user._id);
    socket?.emit('join_room', roomId);
    try {
      const res = await chatAPI.getMessages(roomId);
      setMessages(res.data.messages);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !active) return;
    const roomId = getRoomId(user._id, active.user._id);
    const msgData = {
      roomId,
      content: input.trim(),
      sender: { _id: user._id, firstName: user.firstName, lastName: user.lastName },
      createdAt: new Date().toISOString(),
    };
    socket?.emit('send_message', msgData);
    try {
      await chatAPI.sendMessage({ roomId, content: input.trim() });
    } catch {}
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (active) {
      socket?.emit('typing', { roomId: getRoomId(user._id, active.user._id) });
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Messages</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 0,
        height: 540,
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#fff',
      }}>
        {/* ── Sidebar ─────────────────────────────── */}
        <div style={{ borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #e5e7eb',
            fontSize: 13, fontWeight: 700, color: '#374151',
          }}>
            Conversations
          </div>

          {contacts.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              No conversations yet.<br />Accept a swap request to start chatting.
            </div>
          ) : contacts.map(c => {
            const name = `${c.user.firstName} ${c.user.lastName}`;
            const av = getAv(name);
            const initials = `${c.user.firstName[0]}${c.user.lastName[0]}`.toUpperCase();
            const isActive = active?.user._id === c.user._id;
            return (
              <div key={c.user._id}
                onClick={() => selectContact(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  background: isActive ? '#f0fdf9' : '#fff',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: av.bg, color: av.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{name}</div>
                  <div style={{
                    fontSize: 11, color: '#6b7280',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {c.request.skillOffered} ↔ {c.request.skillWanted}
                  </div>
                </div>
                {isActive && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#1a7a5e', flexShrink: 0,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Chat Main ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!active ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: 14,
            }}>
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                padding: '12px 18px', borderBottom: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {(() => {
                  const name = `${active.user.firstName} ${active.user.lastName}`;
                  const av = getAv(name);
                  return (
                    <>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: av.bg, color: av.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {`${active.user.firstName[0]}${active.user.lastName[0]}`.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {active.request.skillOffered} ↔ {active.request.skillWanted}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 20 }}>
                    No messages yet. Say hello! 👋
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                  const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          padding: '9px 14px',
                          borderRadius: isMe ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                          background: isMe ? '#1a7a5e' : '#f3f4f6',
                          color: isMe ? '#fff' : '#1a1a1a',
                          fontSize: 14, lineHeight: 1.5,
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                          {time}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                    {active.user.firstName} is typing...
                  </div>
                )}
                <div ref={messagesEnd} />
              </div>

              {/* Input */}
              <div style={{
                padding: '10px 14px', borderTop: '1px solid #e5e7eb',
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  style={{
                    flex: 1, padding: '9px 14px',
                    border: '1px solid #e5e7eb', borderRadius: 24,
                    fontSize: 14, outline: 'none', background: '#f9fafb',
                  }}
                />
                <button onClick={sendMessage} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: input.trim() ? '#1a7a5e' : '#e5e7eb',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.15s',
                }}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
