import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

export default function CommentSection({ postId }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    api.get(`/comments/${postId}`)
      .then(r => setComments(r.data))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/comments/${postId}`, {
        text,
        parentComment: replyTo?._id || null,
      });
      setComments(prev => [data, ...prev]);
      setText('');
      setReplyTo(null);
    } finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c._id !== id));
    } catch {}
  };

  const handleLike = async (id) => {
    try {
      await api.post(`/comments/like/${id}`);
      setComments(prev => prev.map(c => {
        if (c._id !== id) return c;
        const liked = c.likes?.includes(user._id);
        return { ...c, likes: liked ? c.likes.filter(l => l !== user._id) : [...(c.likes || []), user._id] };
      }));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-4"><Spinner /></div>;

  return (
    <div className="px-4 pb-4">
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 py-3 border-t border-gray-100 dark:border-gray-800">
        <Avatar src={user?.avatar} username={user?.username} size={8} />
        <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
          {replyTo && (
            <span className="text-xs text-blue-500 shrink-0">@{replyTo.author?.username}</span>
          )}
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder={t('addComment')}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        {replyTo && (
          <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-gray-400">✕</button>
        )}
        <button type="submit" disabled={!text.trim() || sending} className="text-blue-500 disabled:opacity-40">
          <Send size={20} />
        </button>
      </form>

      {/* Comment list */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {comments.map(comment => {
          const isOwner = comment.author?._id === user?._id || user?.role === 'admin';
          const liked = comment.likes?.includes(user?._id);
          return (
            <div key={comment._id} className="flex gap-3">
              <Link to={`/profile/${comment.author?.username}`}>
                <Avatar src={comment.author?.avatar} username={comment.author?.username} size={8} />
              </Link>
              <div className="flex-1">
                <p className="text-sm">
                  <Link to={`/profile/${comment.author?.username}`} className="font-semibold mr-2">
                    {comment.author?.username}
                  </Link>
                  {comment.text}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                  {comment.likes?.length > 0 && (
                    <span className="text-xs text-gray-500">{comment.likes.length} like</span>
                  )}
                  <button onClick={() => setReplyTo(comment)} className="text-xs text-gray-500 hover:text-black dark:hover:text-white">
                    Javob
                  </button>
                  {isOwner && (
                    <button onClick={() => handleDelete(comment._id)} className="text-xs text-red-400 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => handleLike(comment._id)} className={`mt-1 ${liked ? 'text-red-500' : 'text-gray-400'}`}>
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}