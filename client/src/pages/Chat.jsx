import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

function ConversationList({ conversations, activeId, onSelect, onNew }) {
  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="font-bold text-xl">Xabarlar</h1>
      </div>
      <div className="overflow-y-auto flex-1">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-10">Hech qanday suhbat yo'q</p>
        ) : (
          conversations.map(c => {
            const other = c.participants?.find(p => p._id !== c._currentUserId) || c.participants?.[0];
            const unread = c.unreadCount?.get ? c.unreadCount.get(c._currentUserId) : (c.unreadCount?.[c._currentUserId] || 0);
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left ${activeId === c._id ? 'bg-gray-100 dark:bg-gray-900' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={other?.avatar} username={other?.username} size={12} />
                  {other?.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-sm truncate">{other?.username}</p>
                    {c.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(c.lastMessage.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage?.text || 'Media'}</p>
                    {unread > 0 && (
                      <span className="ml-2 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isOwn ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-sm'}`}>
        {msg.media?.url && (
          msg.media.type === 'video'
            ? <video src={msg.media.url} className="max-w-full rounded-xl mb-1" controls />
            : <img src={msg.media.url} alt="" className="max-w-full rounded-xl mb-1" />
        )}
        {msg.text && <p>{msg.text}</p>}
        <p className={`text-xs mt-0.5 ${isOwn ? 'text-white/60 dark:text-black/50' : 'text-gray-400'} text-right`}>
          {new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
          {isOwn && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
        </p>
      </div>
    </div>
  );
}

function ChatWindow({ conversation, onBack }) {
  const { user: me } = useAuthStore();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();
  const typingTimer = useRef();
  const fileRef = useRef();

  const other = conversation.participants?.find(p => p._id !== me?._id) || conversation.participants?.[0];

  useEffect(() => {
    if (!conversation._id) return;
    setLoading(true);
    api.get(`/chat/${conversation._id}/messages`)
      .then(r => setMessages(r.data))
      .finally(() => setLoading(false));

    socket?.emit('joinConversation', conversation._id);
    api.put(`/chat/${conversation._id}/read`).catch(() => {});

    const onMsg = (msg) => {
      if (msg.conversation === conversation._id) {
        setMessages(prev => [...prev, msg]);
        api.put(`/chat/${conversation._id}/read`).catch(() => {});
      }
    };
    const onTyping = ({ userId }) => {
      if (userId !== me?._id) setTyping(true);
    };
    const onStopTyping = ({ userId }) => {
      if (userId !== me?._id) setTyping(false);
    };

    socket?.on('newMessage', onMsg);
    socket?.on('typing', onTyping);
    socket?.on('stopTyping', onStopTyping);

    return () => {
      socket?.off('newMessage', onMsg);
      socket?.off('typing', onTyping);
      socket?.off('stopTyping', onStopTyping);
    };
  }, [conversation._id, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing', { conversationId: conversation._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('stopTyping', { conversationId: conversation._id });
    }, 1500);
  };

  const sendMessage = async (mediaFile) => {
    if (!text.trim() && !mediaFile) return;
    setSending(true);
    const fd = new FormData();
    if (text.trim()) fd.append('text', text);
    if (mediaFile) fd.append('media', mediaFile);
    setText('');
    socket?.emit('stopTyping', { conversationId: conversation._id });
    try {
      const { data } = await api.post(`/chat/${conversation._id}/messages`, fd);
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onBack} className="md:hidden text-gray-600 dark:text-gray-400">
          <ArrowLeft size={22} />
        </button>
        <div className="relative">
          <Avatar src={other?.avatar} username={other?.username} size={10} />
          {other?.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-black" />}
        </div>
        <div>
          <p className="font-semibold text-sm">{other?.username}</p>
          <p className="text-xs text-gray-500">{other?.isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner size={7} /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Xabar yuborish uchun yozing...</p>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg._id} msg={msg} isOwn={msg.sender === me?._id || msg.sender?._id === me?._id} />
          ))
        )}
        {typing && (
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-2 flex items-end gap-2 bg-white dark:bg-black">
        <button onClick={() => fileRef.current.click()} className="text-gray-500 hover:text-black dark:hover:text-white p-2">
          <Image size={22} />
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { if (e.target.files[0]) sendMessage(e.target.files[0]); }} />
        <textarea
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm resize-none max-h-32 outline-none"
          placeholder="Xabar yozing..."
          rows={1}
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!text.trim() || sending}
          className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:opacity-40 transition-opacity"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: me } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const targetUserId = searchParams.get('user');

  useEffect(() => {
    api.get('/chat/conversations')
      .then(r => {
        const convs = r.data.map(c => ({ ...c, _currentUserId: me?._id }));
        setConversations(convs);

        if (targetUserId) {
          const existing = convs.find(c => c.participants?.some(p => p._id === targetUserId));
          if (existing) {
            setActive(existing);
          } else {
            api.get(`/chat/conversations/${targetUserId}`)
              .then(res => {
                const newConv = { ...res.data, _currentUserId: me?._id };
                setConversations(prev => {
                  const already = prev.find(c => c._id === newConv._id);
                  return already ? prev : [newConv, ...prev];
                });
                setActive(newConv);
              })
              .catch(console.error);
          }
        }
      })
      .finally(() => setLoadingConvs(false));
  }, [targetUserId]);

  const handleSelect = (conv) => {
    setActive(conv);
    if (window.innerWidth < 768) navigate(`/chat?conv=${conv._id}`);
  };

  return (
    <div className="pb-20 md:pb-0 h-screen flex overflow-hidden">
      {/* Left — conversation list (always visible on md+, hidden when active on mobile) */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${active ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
        {loadingConvs ? (
          <div className="flex justify-center py-20"><Spinner size={8} /></div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={active?._id}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* Right — chat window */}
      <div className={`flex-1 ${active ? 'flex flex-col' : 'hidden md:flex md:items-center md:justify-center'}`}>
        {active ? (
          <ChatWindow
            conversation={active}
            onBack={() => setActive(null)}
          />
        ) : (
          <p className="text-gray-400 text-sm">Suhbat tanlang</p>
        )}
      </div>
    </div>
  );
}