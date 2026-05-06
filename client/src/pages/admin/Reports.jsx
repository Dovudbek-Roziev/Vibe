import { useEffect, useState } from 'react';
import { CheckCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';

const statusLabel = { pending: 'Kutilmoqda', reviewed: 'Ko\'rildi', resolved: 'Yopildi' };
const statusColor = { pending: 'bg-yellow-100 text-yellow-600', reviewed: 'bg-blue-100 text-blue-600', resolved: 'bg-green-100 text-green-600' };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/reports?status=${filter}`)
      .then(r => setReports(r.data))
      .finally(() => setLoading(false));
  }, [filter]);

  const resolve = async (id) => {
    await api.put(`/admin/reports/${id}/resolve`);
    setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'resolved' } : r));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shikoyatlar</h1>

      <div className="flex gap-2 mb-4">
        {['pending', 'reviewed', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner size={7} /></div> : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">Shikoyat yo'q</p>
          ) : reports.map(r => (
            <div key={r._id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <Avatar src={r.reporter?.avatar} username={r.reporter?.username} size={9} />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">@{r.reporter?.username}</span>
                  {' '}shikoyat qildi:
                  {' '}<span className="font-semibold capitalize">{r.reason}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                {r.post && (
                  <Link to={`/posts/${r.post._id}`} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Eye size={16} className="text-gray-500" />
                  </Link>
                )}
                {r.status !== 'resolved' && (
                  <button onClick={() => resolve(r._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <CheckCircle size={16} className="text-green-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}