import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import CommentSection from './CommentSection';

export default function PostCard({ post, onDelete }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(user?.savedPosts?.includes(post._id));
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleLike = async () => {
    if (!liked) { setHeartAnim(true); setTimeout(() => setHeartAnim(false), 400); }
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    try { await api.post(`/posts/${post._id}/like`); }
    catch { setLiked(l => !l); setLikeCount(c => liked ? c + 1 : c - 1); }
  };

  const handleDoubleTap = () => {
    if (!liked) handleLike();
  };

  const handleSave = async () => {
    setSaved(s => !s);
    try { await api.post(`/users/save/${post._id}`); }
    catch { setSaved(s => !s); }
  };

  const handleDelete = async () => {
    if (!confirm('Postni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
      toast.success('Post o\'chirildi');
    } catch { toast.error('Xatolik'); }
  };

  const handleReport = async () => {
    try {
      await api.post(`/posts/${post._id}/report`, { reason: 'spam' });
      toast.success('Shikoyat yuborildi');
    } catch { toast.error('Xatolik'); }
    setShowMenu(false);
  };

  const isOwner = post.author?._id === user?._id || user?.role === 'admin';

  return (
    <article className="border-b border-gray-100 dark:border-white/[0.06] pb-1 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
          <Avatar src={post.author?.avatar} username={post.author?.username} size={10} />
          <div>
            <p className="font-semibold text-sm flex items-center gap-1">
              {post.author?.username}
              {post.author?.isVerified && (
                <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full text-white text-[9px] font-bold">✓</span>
              )}
            </p>
            {post.location && <p className="text-xs text-gray-400">{post.location}</p>}
          </div>
        </Link>

        <div className="relative">
          <button onClick={() => setShowMenu(m => !m)} className="text-gray-500 hover:text-black dark:hover:text-white p-1">
            <MoreHorizontal size={20} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 min-w-[150px] overflow-hidden"
              >
                {isOwner ? (
                  <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 w-full">
                    <Trash2 size={16} /> {t('delete')}
                  </button>
                ) : (
                  <button onClick={handleReport} className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 w-full">
                    <Flag size={16} /> Shikoyat
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Media */}
      {post.media?.length > 0 && (
        <div className="relative bg-black overflow-hidden">
          {post.media[mediaIdx]?.type === 'video' ? (
            <video
              src={post.media[mediaIdx].url}
              className="w-full max-h-[600px] object-contain"
              controls
              playsInline
            />
          ) : (
            <img
              src={post.media[mediaIdx]?.url}
              alt=""
              className="w-full max-h-[600px] object-contain"
              onDoubleClick={handleDoubleTap}
            />
          )}

          {/* Double-tap heart flash */}
          {heartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart size={80} className="text-white fill-white animate-heart-pop drop-shadow-2xl" />
            </div>
          )}

          {/* Multi-media dots */}
          {post.media.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {post.media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMediaIdx(i)}
                  className={`rounded-full transition-all duration-200 ${i === mediaIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`transition-all duration-150 ${liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 2} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowComments(s => !s)}
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <MessageCircle size={23} strokeWidth={1.9} />
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleSave}
            className={`transition-all duration-150 ${saved ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
          >
            <Bookmark size={23} fill={saved ? 'currentColor' : 'none'} strokeWidth={saved ? 0 : 1.9} />
          </motion.button>
        </div>

        {likeCount > 0 && (
          <p className="text-sm font-bold">{likeCount.toLocaleString()} ta like</p>
        )}

        {post.caption && (
          <p className="text-sm mt-1 leading-relaxed">
            <Link to={`/profile/${post.author?.username}`} className="font-semibold mr-1.5 hover:underline underline-offset-2">{post.author?.username}</Link>
            <span className="text-gray-800 dark:text-gray-200">{post.caption}</span>
          </p>
        )}

        {post.tags?.length > 0 && (
          <p className="text-sm text-blue-500 mt-1 font-medium">{post.tags.map(t => `#${t}`).join(' ')}</p>
        )}

        <button onClick={() => setShowComments(s => !s)} className="text-xs text-gray-400 mt-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          {showComments ? 'Yopish' : post.comments?.length ? `${post.comments.length} ta izoh` : 'Izoh qo\'shing'}
        </button>

        <p className="text-[11px] text-gray-400 mt-1 font-medium tracking-wide uppercase">
          {new Date(post.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CommentSection postId={post._id} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}