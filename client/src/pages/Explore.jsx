import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function Explore() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      const { data } = await api.get(`/posts/explore?page=${p}`);
      setPosts(prev => p === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 12);
      setPage(p);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(1); }, []);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${query}`);
        setUsers(data);
      } finally { setSearchLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const loadMore = () => { if (hasMore && !loading) fetchPosts(page + 1); };
  const lastRef = useInfiniteScroll(loadMore, hasMore);

  return (
    <div className="pb-20 md:pb-0">
      {/* Search bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder={t('searchUsers')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User search results */}
      {query && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          {searchLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">Foydalanuvchi topilmadi</p>
          ) : (
            users.map(u => (
              <Link key={u._id} to={`/profile/${u.username}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <Avatar src={u.avatar} username={u.username} size={11} />
                <div>
                  <p className="font-semibold text-sm">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.fullName}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Post grid */}
      {!query && (
        loading && page === 1 ? (
          <div className="flex justify-center py-20"><Spinner size={8} /></div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((post, i) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                ref={i === posts.length - 1 ? lastRef : null}
                className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 relative group"
              >
                {post.media?.[0]?.type === 'video' ? (
                  <video src={post.media[0].url} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-semibold">❤️ {post.likes?.length || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}