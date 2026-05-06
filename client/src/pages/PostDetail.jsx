import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/common/Spinner';
import { ArrowLeft } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${id}`).then(r => setPost(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={8} /></div>;
  if (!post) return <div className="text-center py-20 text-gray-500">Post topilmadi</div>;

  return (
    <div className="pb-20 md:pb-0">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-400">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-semibold">Post</h1>
      </div>
      <PostCard post={post} onDelete={() => navigate(-1)} />
    </div>
  );
}