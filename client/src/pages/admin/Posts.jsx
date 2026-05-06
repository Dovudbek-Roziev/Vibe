import { useEffect, useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (p = 1) => {
    try {
      const { data } = await api.get(`/admin/posts?page=${p}`);
      setPosts(prev => p === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.pages > p);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(1); }, []);

  const toggleHide = async (postId, isHidden) => {
    await api.put(`/admin/posts/${postId}/hide`);
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, isHidden: !isHidden } : p));
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Postni o\'chirishni tasdiqlaysizmi?')) return;
    await api.delete(`/admin/posts/${postId}`);
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Postlar</h1>
      {loading ? <div className="flex justify-center py-10"><Spinner size={7} /></div> : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {posts.map(post => (
            <div key={post._id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              {post.media?.[0] ? (
                <img src={post.media[0].url} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">@{post.author?.username}</p>
                <p className="text-xs text-gray-500 truncate">{post.caption || '(sarlavha yo\'q)'}</p>
                <p className="text-xs text-gray-400">{post.likes?.length || 0} like · {new Date(post.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${post.isHidden ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {post.isHidden ? 'Yashirin' : 'Ko\'rinadigan'}
              </span>
              <div className="flex gap-1">
                <Link to={`/posts/${post._id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Eye size={16} className="text-gray-500" />
                </Link>
                <button onClick={() => toggleHide(post._id, post.isHidden)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  {post.isHidden ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-yellow-500" />}
                </button>
                <button onClick={() => deletePost(post._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
          {hasMore && (
            <button onClick={() => fetchPosts(page + 1)} className="w-full py-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Ko'proq yuklash
            </button>
          )}
        </div>
      )}
    </div>
  );
}