import { useState, useRef } from 'react';
import { ImagePlus, Film, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

export default function CreatePostModal({ isOpen, onClose, onCreated }) {
  const { t } = useTranslation();
  const fileRef = useRef();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('post');
  const [loading, setLoading] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), isVideo: f.type.startsWith('video') })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return toast.error('Media fayl tanlang');
    setLoading(true);
    const form = new FormData();
    files.forEach(f => form.append('media', f));
    form.append('caption', caption);
    form.append('tags', tags);
    form.append('location', location);
    form.append('type', type);
    try {
      const { data } = await api.post('/posts', form);
      toast.success('Post qo\'shildi');
      onCreated?.(data);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik');
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setFiles([]); setPreviews([]); setCaption(''); setTags(''); setLocation(''); setType('post');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yangi post">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2">
          {['post', 'reel'].map(tp => (
            <button
              key={tp}
              type="button"
              onClick={() => setType(tp)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === tp ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            >
              {tp === 'post' ? 'Post' : 'Reel'}
            </button>
          ))}
        </div>

        {/* Media upload */}
        {previews.length === 0 ? (
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-gray-400 transition-all"
          >
            <ImagePlus size={32} />
            <span className="text-sm">Rasm yoki video tanlang</span>
          </button>
        ) : (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto">
              {previews.map((p, i) => (
                <div key={i} className="relative shrink-0">
                  {p.isVideo ? (
                    <video src={p.url} className="w-32 h-32 object-cover rounded-lg" />
                  ) : (
                    <img src={p.url} className="w-32 h-32 object-cover rounded-lg" alt="" />
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => { setFiles([]); setPreviews([]); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
              <X size={14} />
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFiles} />

        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="Sarlavha yozing..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
          maxLength={2200}
        />
        <input className="input-field" placeholder="#teglar (vergul bilan)" value={tags} onChange={e => setTags(e.target.value)} />
        <input className="input-field" placeholder="Joylashuv" value={location} onChange={e => setLocation(e.target.value)} />

        <button className="btn-primary w-full" disabled={loading || !files.length}>
          {loading ? t('loading') : 'Post qo\'shish'}
        </button>
      </form>
    </Modal>
  );
}