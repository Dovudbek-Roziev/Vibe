import { useEffect, useState } from 'react';
import { Bug, Lightbulb, MessageSquare, HelpCircle, CheckCircle, Eye } from 'lucide-react';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';

const TYPE_META = {
  bug:        { icon: Bug,           color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-500/10',       label: 'Xatolik / Ошибка' },
  suggestion: { icon: Lightbulb,     color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', label: 'Taklif / Предложение' },
  complaint:  { icon: MessageSquare, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',     label: 'Shikoyat / Жалоба' },
  other:      { icon: HelpCircle,    color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-white/10',       label: 'Boshqa / Другое' },
};

const STATUS_LABEL = { new: 'Yangi', read: "O'qildi", resolved: 'Yopildi' };
const STATUS_COLOR = {
  new:      'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  read:     'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
};

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/feedbacks?status=${filter}`)
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  }, [filter]);

  const markRead = async (id) => {
    await api.put(`/admin/feedbacks/${id}/read`);
    setItems(prev => prev.map(f => f._id === id ? { ...f, status: 'read' } : f));
  };

  const resolve = async (id) => {
    await api.put(`/admin/feedbacks/${id}/resolve`);
    setItems(prev => prev.map(f => f._id === id ? { ...f, status: 'resolved' } : f));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchi xabarlari</h1>
          <p className="text-sm text-gray-500 mt-0.5">Muammolar, takliflar va shikoyatlar</p>
        </div>
        <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-semibold px-3 py-1 rounded-full">
          {items.length} ta
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['new', 'read', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={7} /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <CheckCircle size={40} strokeWidth={1.5} />
          <p className="text-sm">Xabar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const meta = TYPE_META[item.type] || TYPE_META.other;
            const Icon = meta.icon;
            const isExpanded = expanded === item._id;
            return (
              <div
                key={item._id}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden transition-all"
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={18} className={meta.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Avatar src={item.user?.avatar} username={item.user?.username} size={6} />
                      <span className="font-semibold text-sm">@{item.user?.username}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-700 dark:text-gray-300 mt-1.5 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {item.message}
                    </p>
                    {item.message.length > 120 && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : item._id)}
                        className="text-xs text-gray-400 hover:text-black dark:hover:text-white mt-1 transition-colors"
                      >
                        {isExpanded ? 'Yig\'ish' : 'Ko\'proq'}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'new' && (
                      <button
                        onClick={() => markRead(item._id)}
                        title="O'qildi deb belgilash"
                        className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      >
                        <Eye size={16} className="text-blue-500" />
                      </button>
                    )}
                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => resolve(item._id)}
                        title="Yopish"
                        className="p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
                      >
                        <CheckCircle size={16} className="text-green-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}