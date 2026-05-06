import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    bio: profile.bio || '',
    website: profile.website || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await api.put('/users/profile', fd);
      onSaved(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-950 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Profilni tahrirlash</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="relative">
            <Avatar src={preview || profile.avatar} username={profile.username} size={20} />
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black rounded-full p-1.5"
            >
              <Camera size={14} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">To'liq ism</label>
            <input
              className="input-field mt-1"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="To'liq ismingiz"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Bio</label>
            <textarea
              className="input-field mt-1 resize-none h-20"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="O'zingiz haqingizda..."
              maxLength={160}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Veb-sayt</label>
            <input
              className="input-field mt-1"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <Spinner size={5} /> : 'Saqlash'}
          </button>
        </form>
      </div>
    </div>
  );
}