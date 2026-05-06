import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

export default function FollowListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${userId}/${type}`)
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  }, [userId, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold">{type === 'followers' ? 'Kuzatuvchilar' : 'Kuzatilmoqda'}</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={7} /></div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">Hech kim yo'q</p>
          ) : (
            users.map(u => (
              <Link key={u._id} to={`/profile/${u.username}`} onClick={onClose} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                <Avatar src={u.avatar} username={u.username} size={11} />
                <div>
                  <p className="font-semibold text-sm">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.fullName}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}