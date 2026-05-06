import { useEffect, useState, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoryBar() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    api.get('/stories').then(r => setGroups(r.data)).catch(() => {});
  }, []);

  const openStory = (group, idx = 0) => {
    setActiveGroup(group);
    setActiveIdx(idx);
    setProgress(0);
  };

  const closeStory = () => {
    setActiveGroup(null);
    clearInterval(timerRef.current);
  };

  const nextStory = () => {
    if (!activeGroup) return;
    if (activeIdx < activeGroup.stories.length - 1) {
      setActiveIdx(i => i + 1);
      setProgress(0);
    } else closeStory();
  };

  const prevStory = () => {
    if (activeIdx > 0) { setActiveIdx(i => i - 1); setProgress(0); }
  };

  useEffect(() => {
    if (!activeGroup) return;
    const story = activeGroup.stories[activeIdx];
    api.post(`/stories/${story._id}/view`).catch(() => {});

    setProgress(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timerRef.current); nextStory(); return 100; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [activeGroup, activeIdx]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('media', file);
    try {
      const { data } = await api.post('/stories', form);
      toast.success('Story qo\'shildi');
      setGroups(prev => {
        const myGroup = prev.find(g => g.user._id === user._id);
        if (myGroup) return prev.map(g => g.user._id === user._id ? { ...g, stories: [data, ...g.stories] } : g);
        return [{ user, stories: [data] }, ...prev];
      });
    } catch { toast.error('Xatolik'); }
  };

  return (
    <>
      {/* Story list */}
      <div className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-800">
        {/* Add story */}
        <button onClick={() => fileRef.current.click()} className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Plus size={22} className="text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 w-16 text-center truncate">Story</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />

        {/* Story groups */}
        {groups.map((group, i) => {
          const isMe = group.user._id === user?._id;
          return (
            <button key={i} onClick={() => openStory(group)} className="flex flex-col items-center gap-1 shrink-0">
              <div className="story-ring w-[68px] h-[68px] flex items-center justify-center">
                <img
                  src={group.user.avatar || `https://ui-avatars.com/api/?name=${group.user.username}&background=000&color=fff`}
                  className="w-[60px] h-[60px] rounded-full object-cover border-2 border-white dark:border-black"
                  alt=""
                />
              </div>
              <span className="text-xs w-16 text-center truncate">{isMe ? 'Siz' : group.user.username}</span>
            </button>
          );
        })}
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {activeGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {activeGroup.stories.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-none"
                    style={{ width: i < activeIdx ? '100%' : i === activeIdx ? `${progress}%` : '0%' }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 flex items-center gap-3 z-10">
              <img src={activeGroup.user.avatar || `https://ui-avatars.com/api/?name=${activeGroup.user.username}`} className="w-9 h-9 rounded-full object-cover" alt="" />
              <span className="text-white font-semibold text-sm">{activeGroup.user.username}</span>
            </div>
            <button onClick={closeStory} className="absolute top-8 right-4 z-10 text-white">
              <X size={24} />
            </button>

            {/* Media */}
            {activeGroup.stories[activeIdx]?.media.type === 'video' ? (
              <video src={activeGroup.stories[activeIdx].media.url} className="max-h-screen max-w-full object-contain" autoPlay muted />
            ) : (
              <img src={activeGroup.stories[activeIdx]?.media.url} className="max-h-screen max-w-full object-contain" alt="" />
            )}

            {/* Text overlay */}
            {activeGroup.stories[activeIdx]?.text && (
              <div className="absolute bottom-16 left-4 right-4 text-center">
                <p className="text-white font-medium text-lg drop-shadow-lg" style={{ color: activeGroup.stories[activeIdx].textColor }}>
                  {activeGroup.stories[activeIdx].text}
                </p>
              </div>
            )}

            {/* Nav */}
            <button onClick={prevStory} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"><ChevronLeft size={32} /></button>
            <button onClick={nextStory} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"><ChevronRight size={32} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}