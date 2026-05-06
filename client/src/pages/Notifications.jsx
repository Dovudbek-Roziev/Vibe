import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

const typeLabel = {
  like: 'postingizni layk qildi',
  comment: 'izoh qoldirdi',
  follow: 'sizni kuzata boshladi',
  mention: 'sizni eslatdi',
  reply: 'izohingizga javob berdi',
  share: 'postingizni ulashdi',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifications(r.data))
      .finally(() => setLoading(false));
    api.put('/notifications/read-all').catch(() => {});
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8} /></div>;

  return (
    <div className="pb-20 md:pb-0">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <h1 className="font-bold text-xl">Bildirishnomalar</h1>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Bildirishnoma yo'q" subtitle="Yangi faollik bo'lganda bu yerda ko'rinadi" />
      ) : (
        <div>
          {notifications.map(n => (
            <div key={n._id} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-900 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
              <Link to={`/profile/${n.sender?.username}`}>
                <Avatar src={n.sender?.avatar} username={n.sender?.username} size={11} />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <Link to={`/profile/${n.sender?.username}`} className="font-semibold">{n.sender?.username}</Link>
                  {' '}{typeLabel[n.type] || n.type}
                </p>
                <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
              {n.post?.media?.[0] && (
                <Link to={`/posts/${n.post._id}`}>
                  <img src={n.post.media[0].url} className="w-12 h-12 object-cover rounded-lg" alt="" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}