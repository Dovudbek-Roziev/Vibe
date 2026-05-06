import { useState, useEffect, useCallback } from 'react';
import { PlusSquare, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import StoryBar from '../components/story/StoryBar';
import PostCard from '../components/post/PostCard';
import CreatePostModal from '../components/post/CreatePostModal';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Home() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      const { data } = await api.get(`/posts/feed?page=${p}`);
      setPosts(prev => p === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(p);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(1); }, []);

  const loadMore = () => { if (hasMore && !loading) fetchPosts(page + 1); };
  const lastRef = useInfiniteScroll(loadMore, hasMore);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleCreated = (post) => setPosts(prev => [post, ...prev]);

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/8 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow">
            <span className="text-sm font-black text-white dark:text-black leading-none">V</span>
          </div>
          <h1 className="text-xl font-black tracking-tight">Vibe</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black transition-all hover:opacity-80 active:scale-95"
        >
          <PlusSquare size={18} />
        </button>
      </div>

      {/* Stories */}
      <StoryBar />

      {/* Feed */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-20"><Spinner size={8} /></div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title={t('noFollowingPosts')}
          subtitle="Odamlarni kuzating va ularning postlarini ko'ring"
        />
      ) : (
        <div>
          {posts.map((post, i) => (
            <div key={post._id} ref={i === posts.length - 1 ? lastRef : null}>
              <PostCard post={post} onDelete={handleDelete} />
            </div>
          ))}
          {loading && <div className="flex justify-center py-6"><Spinner /></div>}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-8">{t('noMore')}</p>
          )}
        </div>
      )}

      <CreatePostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}