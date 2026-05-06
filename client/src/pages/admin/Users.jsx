import { useEffect, useState } from 'react';
import { Search, ShieldOff, Shield } from 'lucide-react';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = async (p = 1, q = '') => {
    try {
      const { data } = await api.get(`/admin/users?page=${p}&search=${q}`);
      setUsers(prev => p === 1 ? data.users : [...prev, ...data.users]);
      setHasMore(data.pages > p);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(1); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(1, query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const toggleBlock = async (userId, isBlocked) => {
    await api.put(`/admin/users/${userId}/block`);
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Foydalanuvchilar</h1>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input-field pl-9" placeholder="Qidirish..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner size={7} /></div> : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {users.map(u => (
            <div key={u._id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <Avatar src={u.avatar} username={u.username} size={10} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.username}</p>
                <p className="text-xs text-gray-500">{u.email} · {new Date(u.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {u.isBlocked ? 'Bloklangan' : 'Faol'}
              </span>
              <button
                onClick={() => toggleBlock(u._id, u.isBlocked)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={u.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
              >
                {u.isBlocked ? <Shield size={18} className="text-green-500" /> : <ShieldOff size={18} className="text-red-500" />}
              </button>
            </div>
          ))}
          {hasMore && (
            <button onClick={() => fetchUsers(page + 1, query)} className="w-full py-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Ko'proq yuklash
            </button>
          )}
        </div>
      )}
    </div>
  );
}