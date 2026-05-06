import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid3X3, Bookmark, Settings, UserPlus, UserMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowListModal from '../components/profile/FollowListModal';

export default function Profile() {
  const { username } = useParams();
  const { t } = useTranslation();
  const { user: me, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [following, setFollowing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [followModal, setFollowModal] = useState(null);

  const isOwn = me?.username === username;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${username}`),
      api.get(`/posts/user/${username}`),
    ]).then(([u, p]) => {
      const profileData = u.data.user || u.data;
      setProfile(profileData);
      setPosts(p.data);
      setFollowing(profileData.followers?.some(f => (f._id || f) === me?._id));
    }).finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (isOwn && tab === 'saved') {
      api.get('/users/saved').then(r => setSaved(r.data)).catch(() => {});
    }
  }, [tab, isOwn]);

  const handleFollow = async () => {
    setFollowing(f => !f);
    setProfile(p => ({
      ...p,
      followers: following
        ? p.followers.filter(id => id !== me._id)
        : [...p.followers, me._id],
    }));
    try { await api.post(`/users/${profile._id}/follow`); }
    catch {
      setFollowing(f => !f);
      setProfile(p => ({
        ...p,
        followers: !following
          ? p.followers.filter(id => id !== me._id)
          : [...p.followers, me._id],
      }));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8} /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Foydalanuvchi topilmadi</div>;

  const grid = tab === 'saved' ? saved : posts;

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">{profile.username}</h1>
        {isOwn && (
          <button onClick={() => setShowEdit(true)}>
            <Settings size={22} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-6 mb-4">
          <Avatar src={profile.avatar} username={profile.username} size={20} />
          <div className="flex gap-6 flex-1 justify-around">
            <button className="text-center" onClick={() => {}}>
              <p className="font-bold text-lg">{posts.length}</p>
              <p className="text-xs text-gray-500">{t('posts')}</p>
            </button>
            <button className="text-center" onClick={() => setFollowModal('followers')}>
              <p className="font-bold text-lg">{profile.followers?.length || 0}</p>
              <p className="text-xs text-gray-500">{t('followers')}</p>
            </button>
            <button className="text-center" onClick={() => setFollowModal('following')}>
              <p className="font-bold text-lg">{profile.following?.length || 0}</p>
              <p className="text-xs text-gray-500">{t('following')}</p>
            </button>
          </div>
        </div>

        {profile.fullName && <p className="font-semibold text-sm">{profile.fullName}</p>}
        {profile.bio && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{profile.bio}</p>}
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm text-blue-500 mt-1 block">{profile.website}</a>
        )}

        <div className="mt-4 flex gap-2">
          {isOwn ? (
            <button onClick={() => setShowEdit(true)} className="flex-1 btn-secondary text-sm py-1.5 font-semibold rounded-lg border border-gray-300 dark:border-gray-700">
              {t('editProfile')}
            </button>
          ) : (
            <>
              <button onClick={handleFollow} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold rounded-lg ${following ? 'border border-gray-300 dark:border-gray-700' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                {following ? <><UserMinus size={16} /> {t('unfollow')}</> : <><UserPlus size={16} /> {t('follow')}</>}
              </button>
              <Link to={`/chat?user=${profile._id}`} className="flex-1 text-center py-1.5 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-700">
                {t('message')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setTab('posts')} className={`flex-1 py-3 flex justify-center ${tab === 'posts' ? 'border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>
          <Grid3X3 size={22} />
        </button>
        {isOwn && (
          <button onClick={() => setTab('saved')} className={`flex-1 py-3 flex justify-center ${tab === 'saved' ? 'border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>
            <Bookmark size={22} />
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {grid.map(post => (
          <Link key={post._id} to={`/posts/${post._id}`} className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            {post.media?.[0]?.type === 'video' ? (
              <video src={post.media[0].url} className="w-full h-full object-cover" />
            ) : (
              <img src={post.media?.[0]?.url} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            )}
          </Link>
        ))}
      </div>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setProfile(updated); updateUser(updated); setShowEdit(false); }}
        />
      )}

      {followModal && (
        <FollowListModal
          userId={profile._id}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
}