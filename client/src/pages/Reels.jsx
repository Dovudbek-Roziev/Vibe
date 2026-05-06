import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Bookmark, VolumeX, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

function ReelItem({ reel, isActive }) {
  const { user } = useAuthStore();
  const videoRef = useRef();
  const [liked, setLiked] = useState(reel.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(reel.likes?.length || 0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) videoRef.current.play().catch(() => {});
    else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }, [isActive]);

  const handleLike = async () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    try { await api.post(`/posts/${reel._id}/like`); }
    catch { setLiked(l => !l); setLikeCount(c => liked ? c + 1 : c - 1); }
  };

  return (
    <div className="reel-item relative flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={reel.media?.[0]?.url}
        className="max-h-screen w-full object-contain"
        loop
        playsInline
        muted={muted}
      />

      {/* Mute button */}
      <button
        onClick={() => setMuted(m => !m)}
        className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white rounded-full p-2.5 border border-white/20 shadow-lg"
      >
        {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>

      {/* Right actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className={liked ? 'text-red-500' : 'text-white'}>
            <Heart size={28} fill={liked ? 'currentColor' : 'none'} />
          </motion.button>
          <span className="text-white text-xs font-medium">{likeCount}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MessageCircle size={28} className="text-white" />
          <span className="text-white text-xs font-medium">{reel.comments?.length || 0}</span>
        </div>
        <Bookmark size={28} className="text-white" />
      </div>

      {/* Author info */}
      <div className="absolute bottom-8 left-4 right-20">
        <Link to={`/profile/${reel.author?.username}`} className="flex items-center gap-2 mb-2">
          <Avatar src={reel.author?.avatar} username={reel.author?.username} size={9} />
          <span className="text-white font-semibold text-sm drop-shadow">{reel.author?.username}</span>
        </Link>
        {reel.caption && (
          <p className="text-white text-sm drop-shadow line-clamp-2">{reel.caption}</p>
        )}
      </div>
    </div>
  );
}

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef();

  useEffect(() => {
    api.get('/posts/reels').then(r => setReels(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight);
      setActiveIdx(idx);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size={8} /></div>;
  if (!reels.length) return <div className="flex justify-center items-center h-screen text-gray-500">Reels yo'q</div>;

  return (
    <div ref={containerRef} className="reel-container">
      {reels.map((reel, i) => (
        <ReelItem key={reel._id} reel={reel} isActive={i === activeIdx} />
      ))}
    </div>
  );
}