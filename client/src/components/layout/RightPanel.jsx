import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RightPanel() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    api.get('/users/suggested').then(r => setSuggested(r.data)).catch(() => {});
  }, []);

  const handleFollow = async (id) => {
    try {
      await api.post(`/users/${id}/follow`);
      setSuggested(prev => prev.filter(u => u._id !== id));
    } catch { toast.error('Xatolik'); }
  };

  return (
    <div className="space-y-6">
      {/* Current user */}
      <Link to={`/profile/${user?.username}`} className="flex items-center gap-3 group">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=000&color=fff`}
          className="w-11 h-11 rounded-full object-cover"
          alt=""
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate group-hover:underline">{user?.username}</p>
          <p className="text-gray-500 text-xs truncate">{user?.fullName}</p>
        </div>
      </Link>

      {/* Suggested users */}
      {suggested.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">Tavsiya etilganlar</p>
          <div className="space-y-3">
            {suggested.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <Link to={`/profile/${u.username}`}>
                  <img
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=eee&color=000`}
                    className="w-9 h-9 rounded-full object-cover"
                    alt=""
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u.username}`} className="text-sm font-semibold hover:underline truncate block">{u.username}</Link>
                  <p className="text-xs text-gray-500">{u.followers?.length} ta kuzatuvchi</p>
                </div>
                <button
                  onClick={() => handleFollow(u._id)}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  {t('follow')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">© 2024 Vibe</p>
    </div>
  );
}