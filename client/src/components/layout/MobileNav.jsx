import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLangStore } from '../../store/langStore';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, Search, Film, MessageCircle, User,
  MoreHorizontal, Sun, Moon, Shield, LogOut, X
} from 'lucide-react';

export default function MobileNav() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { lang, setLang } = useLangStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = [
    { to: '/', icon: Home },
    { to: '/explore', icon: Search },
    { to: '/reels', icon: Film },
    { to: '/chat', icon: MessageCircle },
    { to: `/profile/${user?.username}`, icon: User },
  ];

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-4 glass rounded-2xl shadow-2xl shadow-black/12 dark:shadow-black/70 pb-safe">
          <div className="flex items-center justify-around h-[60px] px-2">
            {items.map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105'
                      : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`
                }
              >
                <Icon size={21} strokeWidth={1.9} />
              </NavLink>
            ))}

            {/* More button */}
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            >
              <MoreHorizontal size={21} strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl pb-8"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-4">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              <div className="px-4 space-y-1">
                {/* Theme toggle */}
                <button
                  onClick={() => { toggleTheme(); setOpen(false); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                >
                  {theme === 'light'
                    ? <Moon size={22} className="text-gray-600 dark:text-gray-400" />
                    : <Sun size={22} className="text-gray-600 dark:text-gray-400" />
                  }
                  <span className="font-medium text-sm">
                    {theme === 'light' ? t('dark') : t('light')} {t('theme')}
                  </span>
                </button>

                {/* Language toggle */}
                <button
                  onClick={() => { setLang(lang === 'uz' ? 'ru' : 'uz'); setOpen(false); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                >
                  <span className="text-xl leading-none">
                    {lang === 'uz' ? '🇺🇿' : '🇷🇺'}
                  </span>
                  <span className="font-medium text-sm">
                    {lang === 'uz' ? "O'zbek" : 'Русский'}
                  </span>
                </button>

                {/* Admin panel */}
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                  >
                    <Shield size={22} className="text-blue-500" />
                    <span className="font-medium text-sm">{t('adminPanel')}</span>
                  </NavLink>
                )}

                <div className="h-px bg-gray-100 dark:bg-white/8 my-1" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-red-500"
                >
                  <LogOut size={22} />
                  <span className="font-medium text-sm">{t('logout')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}