import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLangStore } from '../../store/langStore';
import Footer from '../common/Footer';
import {
  Home, Search, Film, MessageCircle, Bell, User,
  Sun, Moon, LogOut, Shield
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group
       ${isActive
        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-black dark:hover:text-white'
      }`
    }
  >
    <Icon size={20} strokeWidth={1.9} />
    <span className="hidden xl:block">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { lang, setLang } = useLangStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2.5 px-4 mb-8">
        <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
          <span className="text-base font-black text-white dark:text-black leading-none">V</span>
        </div>
        <span className="text-xl font-black tracking-tight hidden xl:block">Vibe</span>
      </NavLink>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <NavItem to="/"           icon={Home}          label={t('home')} />
        <NavItem to="/explore"    icon={Search}        label={t('explore')} />
        <NavItem to="/reels"      icon={Film}          label={t('reels')} />
        <NavItem to="/chat"       icon={MessageCircle} label={t('chat')} />
        <NavItem to="/notifications" icon={Bell}       label={t('notifications')} />
        <NavItem to={`/profile/${user?.username}`} icon={User} label={t('profile')} />
        {user?.role === 'admin' && (
          <NavItem to="/admin" icon={Shield} label={t('adminPanel')} />
        )}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 pt-4 border-t border-gray-100 dark:border-white/8">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-black dark:hover:text-white transition-all"
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={1.9} /> : <Sun size={20} strokeWidth={1.9} />}
          <span className="hidden xl:block">{theme === 'light' ? t('dark') : t('light')}</span>
        </button>

        <button
          onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
          className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-black dark:hover:text-white transition-all"
        >
          <span className="text-lg leading-none">{lang === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
          <span className="hidden xl:block font-medium">{lang === 'uz' ? "O'zbek" : 'Русский'}</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-3">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=000&color=fff&bold=true`}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-white/10"
            alt=""
          />
          <div className="hidden xl:block flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.fullName}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-auto">
            <LogOut size={17} />
          </button>
        </div>
      </div>

      <Footer className="pt-3 hidden xl:block" />
    </div>
  );
}