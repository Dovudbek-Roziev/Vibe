import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Users, FileText, Flag,
  MessageSquareWarning, LogOut, ArrowLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin',          icon: LayoutDashboard,    labelKey: 'dashboard',      exact: true },
  { to: '/admin/users',    icon: Users,              labelKey: 'adminUsers' },
  { to: '/admin/posts',    icon: FileText,           labelKey: 'adminPosts' },
  { to: '/admin/reports',  icon: Flag,               labelKey: 'reports' },
  { to: '/admin/feedback', icon: MessageSquareWarning, labelKey: 'allFeedbacks' },
];

/* Desktop sidebar nav item */
const SideNavItem = ({ to, icon: Icon, label, exact }) => (
  <NavLink
    to={to}
    end={!!exact}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
       ${isActive
         ? 'bg-black text-white dark:bg-white dark:text-black'
         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
       }`
    }
  >
    <Icon size={20} />
    {label}
  </NavLink>
);

export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = NAV_ITEMS.find(item =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const labels = {
    dashboard:    'Dashboard',
    adminUsers:   t('totalUsers'),
    adminPosts:   t('totalPosts'),
    reports:      t('reports'),
    allFeedbacks: t('allFeedbacks'),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white">

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden flex flex-col min-h-screen">

        {/* Mobile top header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-500 leading-none">Vibe Admin</p>
            <h1 className="font-bold text-base leading-tight mt-0.5">
              {currentPage ? labels[currentPage.labelKey] : 'Admin'}
            </h1>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center"
          >
            <LogOut size={17} className="text-red-500" />
          </button>
        </header>

        {/* Mobile content */}
        <main className="flex-1 p-4 pb-28 overflow-auto">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50">
          <div className="mx-3 mb-3 bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-2xl shadow-black/15 dark:shadow-black/60">
            <div className="flex items-center justify-around h-[60px] px-1">
              {NAV_ITEMS.map(({ to, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={!!exact}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.9} />
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:flex min-h-screen">

        {/* Desktop sidebar */}
        <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col px-4 py-6 shrink-0">
          <div className="mb-8 px-1">
            <h1 className="text-xl font-bold">Vibe Admin</h1>
            <p className="text-xs text-gray-500 mt-1">{t('adminPanel')}</p>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map(({ to, icon, labelKey, exact }) => (
              <SideNavItem key={to} to={to} icon={icon} label={labels[labelKey]} exact={exact} />
            ))}
          </nav>

          <div className="space-y-1 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
            >
              <ArrowLeft size={20} /> Saytga qaytish
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
            >
              <LogOut size={20} /> {t('logout')}
            </button>
          </div>
        </aside>

        {/* Desktop content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}