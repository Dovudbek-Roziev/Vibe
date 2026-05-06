import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import Footer from '../components/common/Footer';

export default function Register() {
  const { t } = useTranslation();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error(t('passwordMin'));
    const res = await register(form.username, form.email, form.password, form.fullName);
    if (!res.success) toast.error(res.message || t('loading'));
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 overflow-hidden relative">
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-emerald-300/25 dark:bg-emerald-800/15 blur-3xl animate-float" />
        <div className="absolute -bottom-48 -left-48 w-[28rem] h-[28rem] rounded-full bg-violet-300/25 dark:bg-violet-800/15 blur-3xl animate-float-slow" />
        <div className="absolute top-1/4 left-1/3 w-56 h-56 rounded-full bg-amber-300/20 dark:bg-amber-800/10 blur-3xl animate-pulse-soft" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-up flex-1 flex flex-col justify-center py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[22px] bg-black dark:bg-white mb-5 shadow-2xl">
            <span className="text-3xl font-black text-white dark:text-black leading-none">V</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">Vibe</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">{t('registerTagline')}</p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-3xl p-7 shadow-2xl shadow-black/8 dark:shadow-black/60">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input-field" type="text" placeholder={t('fullName')} value={form.fullName} onChange={set('fullName')} />
            <input className="input-field" type="text" placeholder={t('username')} value={form.username} onChange={set('username')} required />
            <input className="input-field" type="email" placeholder={t('email')} value={form.email} onChange={set('email')} required />
            <div className="relative">
              <input
                className="input-field pr-12"
                type={showPass ? 'text' : 'password'}
                placeholder={t('password')}
                value={form.password}
                onChange={set('password')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="btn-primary w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/25 dark:border-black/25 border-t-white dark:border-t-black rounded-full animate-spin" />
                  {t('loading')}
                </>
              ) : t('register')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('haveAccount')}{' '}
          <Link to="/login" className="text-black dark:text-white font-bold hover:underline underline-offset-4">
            {t('login')}
          </Link>
        </p>
      </div>

      <Footer className="relative z-10 py-4" />
    </div>
  );
}